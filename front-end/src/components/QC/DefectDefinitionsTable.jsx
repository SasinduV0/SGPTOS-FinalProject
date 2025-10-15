import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Loader2, AlertCircle, RefreshCw, Download, FileDown, Search } from 'lucide-react';

// NOTE: It's good practice to define the socket connection outside the component
// to prevent re-connections on every render.
const socket = io('http://localhost:8001', {
  transports: ['websocket'],
  autoConnect: true
});

const DefectDefinitionsTable = () => {
  const [defects, setDefects] = useState([]);
  const [definitions, setDefinitions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Combined function to fetch all initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // FIX: Use Promise.all to fetch definitions and defects at the same time.
      // This is more efficient and prevents race conditions where defects load
      // before their corresponding names (definitions).
      const [defsResponse, defectsResponse] = await Promise.all([
        axios.get('http://localhost:8001/api/defect-definitions/active'),
        axios.get('http://localhost:8001/api/iot/defects')
      ]);

      setDefinitions(defsResponse.data);
      setDefects(defectsResponse.data);
      
      console.log('✅ Definitions and defect records loaded successfully.');

    } catch (err) {
      // FIX: Improved error logging to help you debug the actual backend issue.
      // Check your browser's console for detailed error info (e.g., 404 Not Found, 500 Server Error, CORS policy).
      console.error('Error fetching initial data:', err);
      setError('Failed to fetch defect records. Please check the API connection and console for details.');
    } finally {
      setLoading(false);
    }
  };

  // This function is now only for socket updates
  const refreshDefects = async () => {
    try {
        const response = await axios.get('http://localhost:8001/api/iot/defects');
        setDefects(response.data);
        console.log('🔄 Defect records refreshed via socket update.');
    } catch (err) {
        console.error('Failed to refresh defects after socket update:', err);
        // Optionally set an error state here for the user
    }
  };
  
  // Effect for initial data load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Effect for Socket.IO real-time updates
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket connected for real-time updates');
    });

    // When a 'defectUpdate' event is received, refresh the defect list
    socket.on('defectUpdate', (data) => {
      console.log('📊 Received real-time defect update:', data);
      refreshDefects(); 
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
    
    // FIX: Removed polling with setInterval. Using Socket.IO is the correct
    // and more efficient way to handle real-time updates.

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off('connect');
      socket.off('defectUpdate');
      socket.off('disconnect');
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- All rendering logic from here down is largely the same ---
  // It will now work correctly because of the fixes above.
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        <p className="ml-3 text-gray-700">Loading Defect Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-700 font-semibold mb-2">Error Loading Defect Records</p>
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          <button 
            onClick={loadInitialData} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Helper functions (unchanged)
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getDefinitionName = (category, code) => {
    if (!definitions) return `Code ${code}`;
    if (category === 'section') {
      const item = definitions.sections.find(s => s.code === code);
      return item ? item.name : `Unknown Section`;
    } else if (category === 'type') {
      const item = definitions.types.find(t => t.code === code);
      return item ? item.name : `Unknown Type`;
    } else if (category === 'subtype') {
      for (const type of definitions.types) {
        const item = type.subtypes.find(st => st.code === code);
        if (item) return item.name;
      }
      return `Unknown Subtype`;
    }
    return `Code ${code}`;
  };

  // Data processing and filtering (unchanged)
  const flattenedDefects = defects.flatMap(garment =>
    garment.Defects.map((defect, index) => ({
      id: `${garment._id}-${index}`,
      tagUID: garment.Tag_UID,
      stationID: garment.Station_ID,
      timestamp: garment.Time_Stamp,
      sectionCode: defect.Section,
      sectionName: getDefinitionName('section', defect.Section),
      typeCode: defect.Type,
      typeName: getDefinitionName('type', defect.Type),
      subtypeCode: defect.Subtype,
      subtypeName: getDefinitionName('subtype', defect.Subtype),
      totalDefects: garment.Defects.length
    }))
  );

  const filteredDefects = flattenedDefects.filter(defect => 
    Object.values(defect).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const totalDefectRecords = flattenedDefects.length;
  const totalGarments = defects.length;
  const uniqueStations = [...new Set(defects.map(d => d.Station_ID))].length;

  const exportToCSV = () => {
    const csvHeader = 'Tag UID,Station ID,Section,Type,Subtype,Timestamp\n';
    const csvRows = filteredDefects.map(d => 
        `"${d.tagUID}","${d.stationID}","${d.sectionName}","${d.typeName}","${d.subtypeName}","${formatDate(d.timestamp)}"`
    ).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defect-records.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // JSX for the table and controls (structurally unchanged)
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg mb-6">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Defect Records</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-700 font-medium">Live</span>
            </span>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <FileDown className="h-4 w-4" /> Export CSV
            </button>
          </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Summary Cards */}
        <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-red-700">Total Defects</p><p className="text-2xl font-bold text-red-900">{totalDefectRecords}</p></div>
        <div className="bg-orange-50 p-4 rounded-lg"><p className="text-sm text-orange-700">Affected Garments</p><p className="text-2xl font-bold text-orange-900">{totalGarments}</p></div>
        <div className="bg-yellow-50 p-4 rounded-lg"><p className="text-sm text-yellow-700">Stations Reporting</p><p className="text-2xl font-bold text-yellow-900">{uniqueStations}</p></div>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
      </div>

      {filteredDefects.length === 0 ? (
         <div className="p-8 text-center bg-gray-50 rounded-lg"><AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" /><p className="font-semibold text-gray-700">No Defect Records Found</p></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['Tag UID', 'Station', 'Section', 'Type', 'Subtype', 'Timestamp'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {filteredDefects.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded-full">{d.tagUID}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{d.stationID}</span></td>
                  <td className="px-4 py-3 font-medium text-gray-800">{d.sectionName}</td>
                  <td className="px-4 py-3 text-gray-700">{d.typeName}</td>
                  <td className="px-4 py-3 text-gray-700">{d.subtypeName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DefectDefinitionsTable;
