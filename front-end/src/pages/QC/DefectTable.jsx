import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, FileText, Settings, Layers, ListTree, RefreshCw } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { QCManagerLinks } from '../../pages/Data/SidebarNavlinks';

const DefectTable = () => {
  const [definitions, setDefinitions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch definitions function (reusable)
  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch the active definitions from your backend API
      const response = await axios.get('http://localhost:8001/api/defect-definitions/active');
      setDefinitions(response.data);
      setLastRefresh(new Date());
      console.log('✅ Defect definitions loaded:', response.data);
    } catch (err) {
      setError('Failed to fetch defect definitions. Please check the API connection and try again.');
      console.error('Error fetching defect definitions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDefinitions();
  }, []);

  // Polling: Fetch data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Polling for defect definition updates...');
      fetchDefinitions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex ml-70 mt-20">
        <SideBar title="QC Panel" links={QCManagerLinks} />
        <div className="flex-1 flex items-center justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          <p className="ml-3 text-gray-700">Loading Defect Definitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex ml-60 mt-20">
        <SideBar title="QC Panel" links={QCManagerLinks} />
        <div className="flex-1 overflow-auto">
          <div className="p-6 m-6 bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-700 font-semibold mb-2">Error Loading Defect Definitions</p>
              <p className="text-red-600 text-sm text-center mb-4">{error}</p>
              <div className="bg-white p-4 rounded border border-red-200 text-left w-full max-w-lg">
                <p className="text-xs text-gray-700 font-semibold mb-2">Troubleshooting Steps:</p>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Ensure backend is running on <code className="bg-gray-100 px-1 rounded">http://localhost:8001</code></li>
                  <li>Check if <code className="bg-gray-100 px-1 rounded">/api/defect-definitions/active</code> endpoint is accessible</li>
                  <li>Verify MongoDB has active defect definitions data</li>
                  <li>Check browser console for detailed error logs</li>
                </ol>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!definitions) {
    return (
      <div className="min-h-screen bg-gray-50 flex ml-70 mt-20">
        <SideBar title="QC Panel" links={QCManagerLinks} />
        <div className="flex-1 overflow-auto">
          <div className="p-6 m-6 bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
              <Settings className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-semibold mb-2">No Active Defect Definitions Found</p>
              <p className="text-gray-600 text-sm text-center mb-4">
                There are currently no active defect definitions in the system.
              </p>
              <div className="bg-blue-50 p-4 rounded border border-blue-200 text-left w-full max-w-lg">
                <p className="text-xs text-blue-800 font-semibold mb-2">To add defect definitions:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Use the POST endpoint: <code className="bg-white px-1 rounded">/api/defect-definitions</code></li>
                  <li>Import sample data from <code className="bg-white px-1 rounded">back-end/models/sample-defect-definitions.json</code></li>
                  <li>Or create definitions through the admin panel</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Helper to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Flatten all defect data into a single comprehensive table structure
  const getAllDefectDetails = () => {
    const allDetails = [];
    
    definitions.types.forEach((type) => {
      type.subtypes.forEach((subtype) => {
        definitions.sections.forEach((section) => {
          allDetails.push({
            sectionCode: section.code,
            sectionName: section.name,
            sectionDescription: section.description,
            typeCode: type.code,
            typeName: type.name,
            typeDescription: type.description,
            subtypeCode: subtype.code,
            subtypeName: subtype.name,
            subtypeDescription: subtype.description,
            // Composite unique ID
            uniqueId: `${section.code}-${type.code}-${subtype.code}`
          });
        });
      });
    });
    
    return allDetails;
  };

  const allDefects = getAllDefectDetails();

  return (
    <div className="min-h-screen bg-gray-50 flex ml-70 mt-20">
      {/* Sidebar */}
      <SideBar title="QC Panel" links={QCManagerLinks} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-white rounded-2xl shadow-lg space-y-8 font-sans m-6">
          
          {/* Header Section */}
          <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileText className="mr-3 text-indigo-600" />
                    Active Defect Definitions
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Currently active configuration for defect tracking system.
                </p>
            </div>
            <div className="text-right flex items-center gap-4">
                {/* Manual Refresh Button */}
                <button
                  onClick={fetchDefinitions}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
                  title="Refresh definitions"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs font-medium">Refresh</span>
                </button>
                
                <div>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                      Version: {definitions.version}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                      By: {definitions.createdBy}
                  </p>
                </div>
            </div>
        </div>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates (Auto-refresh every 30s)</span>
            </div>
            <div>
              Last Updated: {formatDate(definitions.lastUpdated)} | Last Refresh: {formatDate(lastRefresh.toISOString())}
            </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase">Total Sections</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{definitions.sections.length}</p>
            </div>
            <Layers className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium uppercase">Total Types</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{definitions.types.length}</p>
            </div>
            <ListTree className="w-10 h-10 text-purple-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-600 font-medium uppercase">Total Subtypes</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">
                {definitions.types.reduce((sum, type) => sum + type.subtypes.length, 0)}
              </p>
            </div>
            <FileText className="w-10 h-10 text-teal-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium uppercase">Total Combinations</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{allDefects.length}</p>
            </div>
            <Settings className="w-10 h-10 text-orange-400 opacity-50" />
          </div>
        </div>
      </div>
      
      {/* Comprehensive Defect Details Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ListTree className="mr-2 text-gray-500"/> Complete Defect Definitions Table
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          All possible defect combinations across sections, types, and subtypes ({allDefects.length} total combinations)
        </p>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-300">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider border-r border-gray-300">
                  Section Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider border-r border-gray-300">
                  Section Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider border-r border-gray-300">
                  Type Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider border-r border-gray-300">
                  Type Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider border-r border-gray-300">
                  Subtype Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider border-r border-gray-300">
                  Subtype Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Full Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allDefects.map((defect, index) => (
                <tr 
                  key={defect.uniqueId}
                  className={`hover:bg-indigo-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium border-r border-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-bold text-indigo-600 border-r border-gray-200">
                    {defect.sectionCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 border-r border-gray-200">
                    {defect.sectionName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-bold text-purple-600 border-r border-gray-200">
                    {defect.typeCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 border-r border-gray-200">
                    {defect.typeName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-bold text-teal-600 border-r border-gray-200">
                    {defect.subtypeCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 border-r border-gray-200">
                    {defect.subtypeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                    <div className="space-y-1">
                      <p><span className="font-medium text-indigo-600">Section:</span> {defect.sectionDescription || 'N/A'}</p>
                      <p><span className="font-medium text-purple-600">Type:</span> {defect.typeDescription || 'N/A'}</p>
                      <p><span className="font-medium text-teal-600">Subtype:</span> {defect.subtypeDescription || 'N/A'}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-semibold">Total Records:</span> {allDefects.length} defect combinations
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">Breakdown:</span> 
              {' '}{definitions.sections.length} Sections × {definitions.types.length} Types × {' '}
              {definitions.types.reduce((sum, type) => sum + type.subtypes.length, 0)} Subtypes (avg)
            </div>
          </div>
        </div>
      </div>
      
      {/* Export/Download Section */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => {
            const dataStr = JSON.stringify(allDefects, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `defect-definitions-${definitions.version}-${new Date().toISOString()}.json`;
            link.click();
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export as JSON
        </button>
        
        <button 
          onClick={() => {
            const csvHeader = 'Row,Section Code,Section Name,Type Code,Type Name,Subtype Code,Subtype Name,Section Desc,Type Desc,Subtype Desc\n';
            const csvRows = allDefects.map((d, i) => 
              `${i+1},${d.sectionCode},"${d.sectionName}",${d.typeCode},"${d.typeName}",${d.subtypeCode},"${d.subtypeName}","${d.sectionDescription || 'N/A'}","${d.typeDescription || 'N/A'}","${d.subtypeDescription || 'N/A'}"`
            ).join('\n');
            const csvContent = csvHeader + csvRows;
            const csvBlob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(csvBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `defect-definitions-${definitions.version}-${new Date().toISOString()}.csv`;
            link.click();
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export as CSV
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default DefectTable;
