export const dashboardData = {
  overview: {
    activeLines: 4,
    totalWorkers: 100,
    avgEfficiency: 87,
    unitsProduced: 2500
  },
  lines: [
    { id: 1, name: 'Line 1', workers: 12, product: 'T-Shirts', efficiency: 92, status: 'high' },
    { id: 2, name: 'Line 2', workers: 13, product: 'Jeans', efficiency: 78, status: 'medium' },
    { id: 3, name: 'Line 3', workers: 22, product: 'Dresses', efficiency: 89, status: 'high' },
    { id: 4, name: 'Line 4', workers: 28, product: 'Shirts', efficiency: 65, status: 'low' }
  ],
  alerts: [
    { id: 1, type: 'high', message: 'Line 4: Efficiency dropped below 70% - Check station 5' },
    { id: 2, type: 'medium', message: 'Line 2: Worker shortage - 2 positions empty' },
    { id: 3, type: 'low', message: 'Line 1: Efficiency dropped below 70% - Check station 2' }
    
  ],
  topPerformers: [
    { name: 'Maria', line: 'Line 1', station: 'Station 3', efficiency: 98 },
    { name: 'Ahmed', line: 'Line 3', station: 'Station 7', efficiency: 96 },
    { name: 'Lisa', line: 'Line 2', station: 'Station 2', efficiency: 94 }
  ],
  availableWorkers: [
    { id: 'SW-001', name: 'Sarah', skills: ['Finishing', 'Sewing'], experience: 5 },
    { id: 'SW-002', name: 'Michael', skills: ['Sewing', 'Finishing'], experience: 3 },
    { id: 'SW-003', name: 'Emma', skills: ['Button Attach', 'Sewing'], experience: 7 },
    { id: 'SW-004', name: 'Olivia', skills: ['Ironing', 'Sewing'], experience: 4 },
    { id: 'SW-005', name: 'James', skills: ['Sewing', 'Cutting'], experience: 6 },
    { id: 'SW-006', name: 'Sophia', skills: ['Finishing', 'Sewing'], experience: 2 },
    { id: 'SW-007', name: 'William', skills: ['Button Attach', 'Sewing'], experience: 5 },
    { id: 'SW-008', name: 'Ava', skills: ['Sewing', 'Ironing'], experience: 3 },
    { id: 'SW-009', name: 'Benjamin', skills: ['Packing', 'Sewing'], experience: 4 },
    { id: 'SW-010', name: 'Marry', skills: ['Sewing', 'Finishing'], experience: 6 },

  ],
  stations: [
    { id: 1, name: 'Station 1', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 2, name: 'Station 2', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 3, name: 'Station 3', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 4, name: 'Station 4', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 5, name: 'Station 5', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 6, name: 'Station 6', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 7, name: 'Station 7', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 8, name: 'Station 8', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 9, name: 'Station 9', worker: null, task: 'Available', efficiency: 0, occupied: false },
    { id: 10, name: 'Station 10', worker: null, task: 'Available', efficiency: 0, occupied: false },
  ]
};