import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SideBar from '../../components/SideBar';
import { QCManagerLinks } from '../../pages/Data/SidebarNavlinks';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes, FaFilter } from 'react-icons/fa';

// Populated with the full dataset from your image.
const initialDefectMasterList = [
    // Body Section
    { id: 1, section: 'Body', type: 'fabric', subType: 'hole' },
    { id: 2, section: 'Body', type: 'fabric', subType: 'stain' },
    { id: 3, section: 'Body', type: 'fabric', subType: 'shading' },
    { id: 4, section: 'Body', type: 'fabric', subType: 'slub' },
    { id: 5, section: 'Body', type: 'stitching', subType: 'skipped' },
    { id: 6, section: 'Body', type: 'stitching', subType: 'broken' },
    { id: 7, section: 'Body', type: 'stitching', subType: 'unknown' },
    { id: 8, section: 'Body', type: 'sewing', subType: 'loss' },
    { id: 9, section: 'Body', type: 'sewing', subType: 'plucking' },
    { id: 10, section: 'Body', type: 'sewing', subType: 'misalignment' },
    { id: 11, section: 'Body', type: 'sewing', subType: 'open seam' },
    { id: 12, section: 'Body', type: 'sewing', subType: 'backtack' },
    { id: 13, section: 'Body', type: 'other', subType: 'seam gap' },
    { id: 14, section: 'Body', type: 'other', subType: 'measurement' },
    { id: 15, section: 'Body', type: 'other', subType: 'button/button hole' },
    { id: 16, section: 'Body', type: 'other', subType: 'twisted' },
    // Hand Section
    { id: 17, section: 'Hand', type: 'fabric', subType: 'hole' },
    { id: 18, section: 'Hand', type: 'fabric', subType: 'stain' },
    { id: 19, section: 'Hand', type: 'fabric', subType: 'shading' },
    { id: 20, section: 'Hand', type: 'fabric', subType: 'slub' },
    { id: 21, section: 'Hand', type: 'stitching', subType: 'skipped' },
    { id: 22, section: 'Hand', type: 'stitching', subType: 'broken' },
    { id: 23, section: 'Hand', type: 'stitching', subType: 'unknown' },
    { id: 24, section: 'Hand', type: 'sewing', subType: 'loss' },
    { id: 25, section: 'Hand', type: 'sewing', subType: 'plucking' },
    { id: 26, section: 'Hand', type: 'sewing', subType: 'misalignment' },
    { id: 27, section: 'Hand', type: 'sewing', subType: 'open seam' },
    { id: 28, section: 'Hand', type: 'sewing', subType: 'backtack' },
    { id: 29, section: 'Hand', type: 'other', subType: 'seam gap' },
    { id: 30, section: 'Hand', type: 'other', subType: 'measurement' },
    { id: 31, section: 'Hand', type: 'other', subType: 'button/button hole' },
    { id: 32, section: 'Hand', type: 'other', subType: 'twisted' },
    // Collar Section
    { id: 33, section: 'Collar', type: 'fabric', subType: 'hole' },
    { id: 34, section: 'Collar', type: 'fabric', subType: 'stain' },
    { id: 35, section: 'Collar', type: 'fabric', subType: 'shading' },
    { id: 36, section: 'Collar', type: 'fabric', subType: 'slub' },
    { id: 37, section: 'Collar', type: 'stitching', subType: 'skipped' },
    { id: 38, section: 'Collar', type: 'stitching', subType: 'broken' },
    { id: 39, section: 'Collar', type: 'stitching', subType: 'unknown' },
    { id: 40, section: 'Collar', type: 'sewing', subType: 'loss' },
    { id: 41, section: 'Collar', type: 'sewing', subType: 'plucking' },
    { id: 42, section: 'Collar', type: 'sewing', subType: 'misalignment' },
    { id: 43, section: 'Collar', type: 'sewing', subType: 'open seam' },
    { id: 44, section: 'Collar', type: 'sewing', subType: 'backtack' },
    { id: 45, section: 'Collar', type: 'other', subType: 'seam gap' },
    { id: 46, section: 'Collar', type: 'other', subType: 'measurement' },
    { id: 47, section: 'Collar', type: 'other', subType: 'button/button hole' },
    { id: 48, section: 'Collar', type: 'other', subType: 'twisted' },
    // Upper back Section
    { id: 49, section: 'Upper back', type: 'fabric', subType: 'hole' },
    { id: 50, section: 'Upper back', type: 'fabric', subType: 'stain' },
    { id: 51, section: 'Upper back', type: 'fabric', subType: 'shading' },
    { id: 52, section: 'Upper back', type: 'fabric', subType: 'slub' },
    { id: 53, section: 'Upper back', type: 'stitching', subType: 'skipped' },
    { id: 54, section: 'Upper back', type: 'stitching', subType: 'broken' },
    { id: 55, section: 'Upper back', type: 'stitching', subType: 'unknown' },
    { id: 56, section: 'Upper back', type: 'sewing', subType: 'loss' },
    { id: 57, section: 'Upper back', type: 'sewing', subType: 'plucking' },
    { id: 58, section: 'Upper back', type: 'sewing', subType: 'misalignment' },
    { id: 59, section: 'Upper back', type: 'sewing', subType: 'open seam' },
    { id: 60, section: 'Upper back', type: 'sewing', subType: 'backtack' },
    { id: 61, section: 'Upper back', type: 'other', subType: 'seam gap' },
    { id: 62, section: 'Upper back', type: 'other', subType: 'measurement' },
    { id: 63, section: 'Upper back', type: 'other', subType: 'button/button hole' },
    { id: 64, section: 'Upper back', type: 'other', subType: 'twisted' },
];


const DefectRate = () => {
    const [selectedProduct, setSelectedProduct] = useState('ALL');
    const [selectedDate, setSelectedDate] = useState('2025-10-14');

    // Local state for defect data management
    const [productCounts, setProductCounts] = useState({ 'A': 1000, 'B': 800, 'C': 1200 });
    const [products] = useState(['ALL', 'A', 'B', 'C']);
    const [defectData] = useState([
        { id: 1, defectType: 'Stitching - Skipped', defectCount: 10, unit: 'Unit 1', line: 'Line A1', products: ['A'] },
        { id: 2, defectType: 'Fabric - Stain', defectCount: 5, unit: 'Unit 2', line: 'Line A2', products: ['A'] },
        { id: 3, defectType: 'Sewing - Misalignment', defectCount: 6, unit: 'Unit 1', line: 'Line B1', products: ['B'] },
    ]);

    // State for managing the defect master list and the modal
    const [defectMasterList, setDefectMasterList] = useState(initialDefectMasterList);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentDefectType, setCurrentDefectType] = useState({ id: null, section: '', type: '', subType: '' });

    // NEW: State for filters
    const [filters, setFilters] = useState({ section: '', type: '', subType: '' });

    // Helper functions
    const getCurrentProductCount = (product) => {
        if (product === 'ALL') return Object.values(productCounts).reduce((sum, count) => sum + count, 0);
        return productCounts[product] || 0;
    };

    const getFilteredDefects = () => {
        if (selectedProduct === 'ALL') return defectData;
        return defectData.filter(item => item.products && item.products.includes(selectedProduct));
    };
    
    const calculateDefectRate = (defectCount, productCount) => {
        if (productCount === 0 || !productCount) return 0;
        return (defectCount / productCount) * 100;
    };

    const currentProductCount = getCurrentProductCount(selectedProduct);
    const filteredDefects = getFilteredDefects();

    const chartData = filteredDefects.map(item => ({
        name: item.defectType,
        defects: item.defectCount,
        rate: calculateDefectRate(item.defectCount, currentProductCount)
    })).sort((a, b) => b.rate - a.rate);

    // CRUD Handlers
    const handleOpenModal = (mode, defect = { id: null, section: '', type: '', subType: '' }) => {
        setModalMode(mode);
        setCurrentDefectType(defect);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveDefectType = () => {
        if (!currentDefectType.section || !currentDefectType.type || !currentDefectType.subType) {
            alert('All fields are required.');
            return;
        }
        if (modalMode === 'add') {
            setDefectMasterList([...defectMasterList, { ...currentDefectType, id: Date.now() }]);
        } else {
            setDefectMasterList(defectMasterList.map(d => d.id === currentDefectType.id ? currentDefectType : d));
        }
        handleCloseModal();
    };

    const handleDeleteDefectType = (id) => {
        if (window.confirm('Are you sure you want to delete this defect type?')) {
            setDefectMasterList(defectMasterList.filter(d => d.id !== id));
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDefectType(prev => ({ ...prev, [name]: value }));
    };

    // NEW: Handler for filter input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // NEW: Logic to apply filters
    const filteredMasterList = defectMasterList.filter(defect => {
        return (
            defect.section.toLowerCase().includes(filters.section.toLowerCase()) &&
            defect.type.toLowerCase().includes(filters.type.toLowerCase()) &&
            defect.subType.toLowerCase().includes(filters.subType.toLowerCase())
        );
    });

    return (
        <div className="ml-70 mt-20 min-h-screen bg-gray-100">
            <SideBar title="QC Panel" links={QCManagerLinks} />

            <div className="p-4 lg:p-8">
                {/* Header Controls */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-8">
                    {/* ... Omitted for brevity ... */}
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {/* ... QC Defect Details & Chart Section Omitted for brevity ... */}
                    </div>

                    <div className="bg-white rounded-xl shadow-md border">
                        <div className="p-6 border-b flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Manage Defect Classifications</h2>
                                <p className="text-sm text-gray-500 mt-1">The master list of all possible defect types.</p>
                            </div>
                            <button
                                onClick={() => handleOpenModal('add')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                            >
                                <FaPlus />
                                <span>Add New</span>
                            </button>
                        </div>
                        
                        {/* NEW: Filter Input Section */}
                        <div className="p-4 border-b grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Section</label>
                                <input type="text" name="section" value={filters.section} onChange={handleFilterChange} placeholder="e.g., Body"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                                <input type="text" name="type" value={filters.type} onChange={handleFilterChange} placeholder="e.g., fabric"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Sub Type</label>
                                <input type="text" name="subType" value={filters.subType} onChange={handleFilterChange} placeholder="e.g., hole"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-1">
                                <button onClick={() => setFilters({ section: '', type: '', subType: '' })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors">
                                    <FaTimes />
                                    <span>Clear Filters</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* NEW: Map over the filtered list and show an intelligent empty state message */}
                                    {filteredMasterList.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-gray-500">
                                                {defectMasterList.length === 0 
                                                    ? "No defect types have been added yet."
                                                    : "No results match your filters."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMasterList.map((defect) => (
                                            <tr key={defect.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{defect.section}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{defect.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{defect.subType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button onClick={() => handleOpenModal('edit', defect)} className="text-yellow-500 hover:text-yellow-700 transition-colors text-lg"><FaPencilAlt /></button>
                                                        <button onClick={() => handleDeleteDefectType(defect.id)} className="text-red-500 hover:text-red-700 transition-colors text-lg"><FaTrash /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                     {/* ... Modal Code Omitted for brevity ... */}
                </div>
            )}
        </div>
    );
};

export default DefectRate;