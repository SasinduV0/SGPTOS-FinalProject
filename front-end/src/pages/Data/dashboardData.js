export const dashboardData = {
  overview: {
    activeLines: 4,
    totalWorkers: 100,
    avgEfficiency: 87,
    unitsProduced: 2500
  },

  lines: [
    {
      id: 1,
      name: 'Line 1',
      workers: 12,
      
      efficiency: 92,
      status: 'high',
      workerDetails: [
        { id: 'SW-001', name: 'Sarah' },
        { id: 'SW-002', name: 'Michael' },
        { id: 'SW-003', name: 'Emma' },
        { id: 'SW-004', name: 'Olivia' },
        { id: 'SW-005', name: 'James' }
      ]
    },

    {
      id: 2,
      name: 'Line 2',
      workers: 13,
      
      efficiency: 78,
      status: 'medium',
      workerDetails: [
        { id: 'SW-006', name: 'Sophia' },
        { id: 'SW-007', name: 'William' },
        { id: 'SW-008', name: 'Ava' },
        { id:'SW-109', name: 'Lisa' },
        { id: 'SW-010', name: 'Marry' }
      ]
    },

    {
      id: 3,
      name: 'Line 3',
      workers: 22,
      
      efficiency: 89,
      status: 'high',
      workerDetails: [
        { id: 'SW-011', name: 'Nimal' },
        { id: 'SW-012', name: 'Priya' },
        { id: 'SW-013', name: 'Sunil' },
        { id: 'SW-014', name: 'Kavya' },
        { id: 'SW-015', name: 'Ahmed' }
      ]
    },

    {
      id: 4,
      name: 'Line 4',
      workers: 28,
      efficiency: 65,
      status: 'low',
      workerDetails: [
        { id: 'SW-016', name: 'Ravi' },
        { id: 'SW-017', name: 'Saman' },
        { id: 'SW-018', name: 'Dilani' },
        { id: 'SW-019', name: 'Kamal' },
        { id: 'SW-020', name: 'Anusha' }
      ]
    }
  ],

  alerts: [
    { id: 1, type: 'high', message: 'Line 4: Efficiency dropped below 70% - Check station 5' },
    { id: 2, type: 'medium', message: 'Line 2: Worker shortage - 2 positions empty' },
    { id: 3, type: 'low', message: 'Line 1: Efficiency dropped below 70% - Check station 2' }
    
  ],

  topPerformers: [
    { id:'SW-010', name: 'Marry', line: 'Line 1', station: 'Station 3', efficiency: 98 },
    { id:'SW-207', name: 'Ahmed', line: 'Line 3', station: 'Station 7', efficiency: 96 },
    { id:'SW-109', name: 'Lisa', line: 'Line 2', station: 'Station 2', efficiency: 94 }
  ],

  availableWorkers: [
    // Line 1 workers
    { id: 'SW-001', name: 'Sarah', skills: ['Finishing', 'Sewing'], experience: 5 },
    { id: 'SW-002', name: 'Michael', skills: ['Sewing', 'Finishing'], experience: 3 },
    { id: 'SW-003', name: 'Emma', skills: ['Button Attach', 'Sewing'], experience: 7 },
    { id: 'SW-004', name: 'Olivia', skills: ['Ironing', 'Sewing'], experience: 4 },
    { id: 'SW-005', name: 'James', skills: ['Sewing', 'Cutting'], experience: 6 },
    // Line 2 workers
    { id: 'SW-006', name: 'Sophia', skills: ['Finishing', 'Sewing'], experience: 2 },
    { id: 'SW-007', name: 'William', skills: ['Button Attach', 'Sewing'], experience: 5 },
    { id: 'SW-008', name: 'Ava', skills: ['Sewing', 'Ironing'], experience: 3 },
    { id: 'SW-109', name: 'Lisa', skills: ['Packing', 'Sewing'], experience: 4 },
    { id: 'SW-010', name: 'Marry', skills: ['Sewing', 'Finishing'], experience: 6 },
    // Line 3 workers
    { id: 'SW-011', name: 'Nimal', skills: ['Cutting', 'Sewing'], experience: 8 },
    { id: 'SW-012', name: 'Priya', skills: ['Ironing', 'Packing'], experience: 4 },
    { id: 'SW-013', name: 'Sunil', skills: ['Button Attach', 'Finishing'], experience: 6 },
    { id: 'SW-014', name: 'Kavya', skills: ['Sewing', 'Finishing'], experience: 5 },
    { id: 'SW-015', name: 'Ahmed', skills: ['Packing', 'Ironing'], experience: 7 },
    // Line 4 workers
    { id: 'SW-016', name: 'Ravi', skills: ['Cutting', 'Ironing'], experience: 6 },
    { id: 'SW-017', name: 'Saman', skills: ['Sewing', 'Packing'], experience: 3 },
    { id: 'SW-018', name: 'Dilani', skills: ['Finishing', 'Button Attach'], experience: 4 },
    { id: 'SW-019', name: 'Kamal', skills: ['Ironing', 'Sewing'], experience: 5 },
    { id: 'SW-020', name: 'Anusha', skills: ['Packing', 'Finishing'], experience: 2 },
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