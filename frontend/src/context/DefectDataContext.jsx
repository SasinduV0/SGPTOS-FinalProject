import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const DefectDataContext = createContext();

// Helper function to get consistent colors for defect types
const getDefectColor = (defectType) => {
  const colorMap = {
    'Stitching errors': '#EF4444',
    'Fabric damage': '#F97316', 
    'Color mismatches': '#06B6D4',
    'Misaligned stickers': '#3B82F6',
    'Finishing defects': '#8B5CF6',
    'Others': '#10B981'
  };
  return colorMap[defectType] || '#6B7280';
};

// Provider component
export const DefectDataProvider = ({ children }) => {
  // Product counts for each product type
  const [productCounts, setProductCounts] = useState({
    'A': 1000,
    'B': 800,
    'C': 1200
  });

  const [products, setProducts] = useState(['ALL', 'A', 'B', 'C']);

  // Defect data with product associations
  const [defectData, setDefectData] = useState([
    { id: 1, defectType: 'Stitching errors', defectCount: 10, products: ['A', 'B'] },
    { id: 2, defectType: 'Fabric damage', defectCount: 9, products: ['A', 'C'] },
    { id: 3, defectType: 'Color mismatches', defectCount: 6, products: ['B'] },
    { id: 4, defectType: 'Misaligned stickers', defectCount: 7, products: ['A', 'B', 'C'] },
    { id: 5, defectType: 'Finishing defects', defectCount: 6, products: ['C'] },
    { id: 6, defectType: 'Others', defectCount: 10, products: ['A', 'B', 'C'] }
  ]);

  // Calculate defect rate
  const calculateDefectRate = useCallback((defectCount, productCount) => {
    if (productCount === 0 || !productCount) return 0;
    return parseFloat(((defectCount / productCount) * 100).toFixed(2));
  }, []);

  // Get total product count
  const getTotalProductCount = useCallback(() => {
    return Object.values(productCounts).reduce((sum, count) => sum + count, 0);
  }, [productCounts]);

  // Get product count for specific product or all
  const getCurrentProductCount = useCallback((selectedProduct = 'ALL') => {
    if (selectedProduct === 'ALL') {
      return getTotalProductCount();
    }
    return productCounts[selectedProduct] || 0;
  }, [productCounts, getTotalProductCount]);

  // Aggregate defects by type across all products or specific product
  const getAggregatedDefectData = useCallback((selectedProduct = 'ALL') => {
    let filteredData = defectData;
    
    // Filter by product if not 'ALL'
    if (selectedProduct !== 'ALL') {
      filteredData = defectData.filter(item => 
        item.products && item.products.includes(selectedProduct)
      );
    }

    // Create aggregated data
    const aggregated = {};
    filteredData.forEach(item => {
      if (aggregated[item.defectType]) {
        aggregated[item.defectType].count += item.defectCount;
      } else {
        aggregated[item.defectType] = {
          type: item.defectType,
          count: item.defectCount,
          color: getDefectColor(item.defectType)
        };
      }
    });

    // Calculate rates for aggregated data
    const currentProductCount = getCurrentProductCount(selectedProduct);
    return Object.values(aggregated).map(item => ({
      ...item,
      rate: calculateDefectRate(item.count, currentProductCount)
    }));
  }, [defectData, getCurrentProductCount, calculateDefectRate]);

  // Generate time series data based on current defects
  const getTimeSeriesData = useCallback((selectedProduct = 'ALL') => {
    const aggregatedData = getAggregatedDefectData(selectedProduct);
    const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    
    return times.map((time, index) => {
      const multiplier = (index + 1) / 6; // Progressive increase throughout the day
      const dataPoint = { time };
      
      aggregatedData.forEach(defect => {
        const key = defect.type.toLowerCase()
          .replace(/\s+/g, '')
          .replace('errors', '')
          .replace('defects', '')
          .replace('mismatches', 'mismatch');
        dataPoint[key] = Math.round(defect.count * multiplier);
      });
      
      return dataPoint;
    });
  }, [getAggregatedDefectData]);

  // Add new product
  const addProduct = useCallback((productName) => {
    if (productName && !products.includes(productName)) {
      setProducts(prev => [...prev, productName]);
      setProductCounts(prev => ({ ...prev, [productName]: 0 }));
      return true;
    }
    return false;
  }, [products]);

  // Update product count
  const updateProductCount = useCallback((productName, count) => {
    setProductCounts(prev => ({
      ...prev,
      [productName]: parseInt(count) || 0
    }));
  }, []);

  // Add new defect
  const addDefect = useCallback((newDefect) => {
    const newId = Math.max(...defectData.map(d => d.id), 0) + 1;
    setDefectData(prev => [...prev, {
      id: newId,
      defectType: newDefect.defectType,
      defectCount: parseInt(newDefect.defectCount),
      products: newDefect.products || ['A', 'B', 'C'] // Default to all products
    }]);
  }, [defectData]);

  // Update defect
  const updateDefect = useCallback((id, updatedData) => {
    setDefectData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
  }, []);

  // Delete defect
  const deleteDefect = useCallback((id) => {
    setDefectData(prev => prev.filter(item => item.id !== id));
  }, []);

  // Get defects for specific product
  const getDefectsForProduct = useCallback((productName) => {
    return defectData.filter(item => 
      item.products && item.products.includes(productName)
    );
  }, [defectData]);

  const value = {
    // State
    productCounts,
    products,
    defectData,
    
    // Computed values
    getTotalProductCount,
    getCurrentProductCount,
    getAggregatedDefectData,
    getTimeSeriesData,
    getDefectsForProduct,
    
    // Actions
    addProduct,
    updateProductCount,
    addDefect,
    updateDefect,
    deleteDefect,
    
    // Utilities
    calculateDefectRate
  };

  return (
    <DefectDataContext.Provider value={value}>
      {children}
    </DefectDataContext.Provider>
  );
};

// Custom hook to use the context
export const useDefectData = () => {
  const context = useContext(DefectDataContext);
  if (!context) {
    throw new Error('useDefectData must be used within a DefectDataProvider');
  }
  return context;
};

export default DefectDataContext;