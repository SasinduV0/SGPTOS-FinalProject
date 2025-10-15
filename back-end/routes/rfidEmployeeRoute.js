const express = require('express');
const RfidEmployee = require('../models/RfidEmployee');
const router = express.Router();
const ID_REGEX = /^E[1-9a-f]{3}$/;

// Valid RFIDs list (should match validRfids.js and productRfid.js)
const getValidRfids = () => {
  return [
    'E9 EB 39 03', 'F5 A6 28 A1', 'E5 B7 9B A1', 'E5 CC 9B A1'
  ];
};

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`RFID Route: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);
  next();
});

// GET /api/rfid-employees - සියලුම RFID employees ලබා ගන්න
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    console.log('=== GET EMPLOYEES DEBUG ===');
    console.log('Query params:', { search, status });
    
    // Search functionality
    if (search) {
      query.$or = [
        { rfidNumber: { $regex: search, $options: 'i' } },
        { empName: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    console.log('MongoDB query:', query);
    
    const employees = await RfidEmployee.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${employees.length} employees`);
    
    res.status(200).json({
      success: true,
      message: 'RFID employees fetched successfully',
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error fetching RFID employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFID employees',
      error: error.message
    });
  }
});

// GET /api/rfid-employees/:id - ID වලින් එක employee එකක් ලබා ගන්න
router.get('/:id', async (req, res) => {
  try {
    console.log('=== GET SINGLE EMPLOYEE DEBUG ===');
    console.log('Employee ID:', req.params.id);
    
    const employee = await RfidEmployee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found');
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    console.log('Employee found:', employee);
    
    res.status(200).json({
      success: true,
      message: 'RFID employee fetched successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error fetching RFID employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFID employee',
      error: error.message
    });
  }
});

// POST /api/rfid-employees - නව RFID employee එකක් හදන්න
router.post('/', async (req, res) => {
  try {
    const { rfidNumber, empName, empId, status, department, phoneNumber, email } = req.body;
    
    console.log('=== CREATE EMPLOYEE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Extracted fields:', { rfidNumber, empName, empId, status, department, phoneNumber, email });
    
    // Validation
    if (!rfidNumber || !empName || !empId) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'RFID Number, Employee Name, and Employee ID are required',
        missingFields: {
          rfidNumber: !rfidNumber,
          empName: !empName,
          empId: !empId
        }
      });
    }

    // Safe string conversion and trimming
    const trimmedRfidNumber = String(rfidNumber || '').trim();
    const trimmedEmpName = String(empName || '').trim();
    const trimmedEmpId = String(empId || '').trim();

    console.log('Trimmed values:', { trimmedRfidNumber, trimmedEmpName, trimmedEmpId });

    if (!trimmedRfidNumber || !trimmedEmpName || !trimmedEmpId) {
      console.log('Validation failed: Empty trimmed fields');
      return res.status(400).json({
        success: false,
        message: 'RFID Number, Employee Name, and Employee ID cannot be empty',
        emptyFields: {
          rfidNumber: !trimmedRfidNumber,
          empName: !trimmedEmpName,
          empId: !trimmedEmpId
        }
      });
    }

    // Check if RFID is in valid list
    const validRfids = getValidRfids();
    if (!validRfids.includes(trimmedRfidNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFID number. Please select from valid RFIDs.'
      });
    }
    
    // Check if RFID number already exists
    const existingRfid = await RfidEmployee.findOne({ rfidNumber: trimmedRfidNumber });
    if (existingRfid) {
      console.log('RFID number already exists:', trimmedRfidNumber);
      return res.status(409).json({
        success: false,
        message: 'RFID number already assigned to another employee'
      });
    }
    
    // Validate empId format early for clearer message
    const ID_REGEX = /^E[1-9a-f]{3}$/;
    if (!ID_REGEX.test(trimmedEmpId)) {
      console.log('Invalid empId format:', trimmedEmpId);
      return res.status(400).json({ success: false, message: "empId format invalid. Must start with capital 'E' followed by three characters each 1-9 or a-f. Example: E1a3" });
    }

    // Check if Employee ID already exists  
    const existingEmpId = await RfidEmployee.findOne({ empId: trimmedEmpId });
    if (existingEmpId) {
      console.log('Employee ID already exists:', trimmedEmpId);
      return res.status(409).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    
    const newEmployeeData = {
      rfidNumber: trimmedRfidNumber,
      empName: trimmedEmpName,
      empId: trimmedEmpId,
      status: status || 'ACTIVE',
      department: String(department || '').trim(),
      phoneNumber: String(phoneNumber || '').trim(),
      email: String(email || '').trim()
    };
    
    console.log('Creating employee with data:', newEmployeeData);
    
    const newEmployee = new RfidEmployee(newEmployeeData);
    const savedEmployee = await newEmployee.save();
    
    console.log('Employee saved successfully:', savedEmployee);
    
    res.status(201).json({
      success: true,
      message: 'RFID employee created successfully',
      data: savedEmployee
    });
  } catch (error) {
    console.error('=== CREATE ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.error('Duplicate key error:', field, error.keyValue);
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating RFID employee',
      error: error.message
    });
  }
});

// PUT /api/rfid-employees/:id - RFID employee එකක් update කරන්න
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rfidNumber, empName, empId, status, department, phoneNumber, email } = req.body;
    
    console.log('=== UPDATE EMPLOYEE DEBUG ===');
    console.log('Employee ID:', id);
    console.log('Request body:', req.body);
    console.log('Extracted fields:', { rfidNumber, empName, empId, status, department, phoneNumber, email });
    
    // Basic validation
    if (!rfidNumber || !empName || !empId) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'RFID Number, Employee Name, and Employee ID are required',
        missingFields: {
          rfidNumber: !rfidNumber,
          empName: !empName,
          empId: !empId
        }
      });
    }

    // Check if employee exists first
    const existingEmployee = await RfidEmployee.findById(id);
    if (!existingEmployee) {
      console.log('Employee not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    console.log('Existing employee found:', existingEmployee);

    // Safe string conversion and trimming
    const trimmedRfidNumber = String(rfidNumber || '').trim();
    const trimmedEmpName = String(empName || '').trim();
    const trimmedEmpId = String(empId || '').trim();

    // Validate empId format early in update
    const ID_REGEX = /^E[1-9a-f]{3}$/;
    if (!ID_REGEX.test(trimmedEmpId)) {
      console.log('Invalid empId format (update):', trimmedEmpId);
      return res.status(400).json({ success: false, message: "empId format invalid. Must start with capital 'E' followed by three characters each 1-9 or a-f. Example: E1a3" });
    }

    console.log('Trimmed values:', { trimmedRfidNumber, trimmedEmpName, trimmedEmpId });

    if (!trimmedRfidNumber || !trimmedEmpName || !trimmedEmpId) {
      console.log('Validation failed: Empty trimmed fields');
      return res.status(400).json({
        success: false,
        message: 'RFID Number, Employee Name, and Employee ID cannot be empty',
        emptyFields: {
          rfidNumber: !trimmedRfidNumber,
          empName: !trimmedEmpName,
          empId: !trimmedEmpId
        }
      });
    }

    // Check if RFID is in valid list
    const validRfids = getValidRfids();
    if (!validRfids.includes(trimmedRfidNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFID number. Please select from valid RFIDs.'
      });
    }
    
    // Check for duplicates (excluding current employee)
    const existingRfid = await RfidEmployee.findOne({ 
      rfidNumber: trimmedRfidNumber,
      _id: { $ne: id }
    });
    
    if (existingRfid) {
      console.log('RFID number conflict:', trimmedRfidNumber, 'exists in:', existingRfid._id);
      return res.status(409).json({
        success: false,
        message: 'RFID number already assigned to another employee'
      });
    }

    const existingEmpId = await RfidEmployee.findOne({ 
      empId: trimmedEmpId,
      _id: { $ne: id }
    });
    
    if (existingEmpId) {
      console.log('Employee ID conflict:', trimmedEmpId, 'exists in:', existingEmpId._id);
      return res.status(409).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    
    // Prepare update data
    const updateData = {
      rfidNumber: trimmedRfidNumber,
      empName: trimmedEmpName,
      empId: trimmedEmpId,
      status: status || 'ACTIVE',
      department: String(department || '').trim(),
      phoneNumber: String(phoneNumber || '').trim(),
      email: String(email || '').trim()
    };

    console.log('Final update data:', updateData);
    
    const updatedEmployee = await RfidEmployee.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );
    
    if (!updatedEmployee) {
      console.log('Update failed: Employee not found after update');
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }

    console.log('Employee updated successfully:', updatedEmployee);
    
    res.status(200).json({
      success: true,
      message: 'RFID employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('=== UPDATE ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        details: error.errors
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      console.error('Invalid ID format:', error.value);
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.error('Duplicate key error:', field, error.keyValue);
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating RFID employee',
      error: error.message
    });
  }
});

// DELETE /api/rfid-employees/:id - RFID employee එකක් delete කරන්න
router.delete('/:id', async (req, res) => {
  try {
    console.log('=== DELETE EMPLOYEE DEBUG ===');
    console.log('Deleting employee with ID:', req.params.id);
    
    const deletedEmployee = await RfidEmployee.findByIdAndDelete(req.params.id);
    
    if (!deletedEmployee) {
      console.log('Employee not found for deletion');
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    console.log('Employee deleted successfully:', deletedEmployee);
    
    res.status(200).json({
      success: true,
      message: 'RFID employee deleted successfully',
      data: deletedEmployee
    });
  } catch (error) {
    console.error('=== DELETE ERROR ===');
    console.error('Error deleting RFID employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting RFID employee',
      error: error.message
    });
  }
});

// PATCH /api/rfid-employees/:id/status - RFID employee status update කරන්න
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('=== UPDATE STATUS DEBUG ===');
    console.log('Updating status for employee:', id, 'to:', status);
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      console.log('Invalid status provided:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE or INACTIVE'
      });
    }
    
    const updatedEmployee = await RfidEmployee.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      console.log('Employee not found for status update');
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    console.log('Status updated successfully:', updatedEmployee);
    
    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('=== STATUS UPDATE ERROR ===');
    console.error('Error updating employee status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message
    });
  }
});

module.exports = router;