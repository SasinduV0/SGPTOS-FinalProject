const express = require('express');
const RfidEmployee = require('../models/RfidEmployee');
const router = express.Router();

// GET /api/rfid-employees - සියලුම RFID employees ලබා ගන්න
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
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
    
    const employees = await RfidEmployee.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'RFID employees fetched successfully',
      data: employees,
      count: employees.length
    });
  } catch (error) {
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
    const employee = await RfidEmployee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'RFID employee fetched successfully',
      data: employee
    });
  } catch (error) {
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
    const { rfidNumber, empName, empId, status, department, position, phoneNumber, email } = req.body;
    
    // Validation
    if (!rfidNumber || !empName || !empId) {
      return res.status(400).json({
        success: false,
        message: 'RFID Number, Employee Name, and Employee ID are required'
      });
    }
    
    // Check if RFID number already exists
    const existingRfid = await RfidEmployee.findOne({ rfidNumber });
    if (existingRfid) {
      return res.status(409).json({
        success: false,
        message: 'RFID number already exists'
      });
    }
    
    // Check if Employee ID already exists
    const existingEmpId = await RfidEmployee.findOne({ empId });
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    
    const newEmployee = new RfidEmployee({
      rfidNumber,
      empName,
      empId,
      status: status || 'ACTIVE',
      department,
      position,
      phoneNumber,
      email
    });
    
    const savedEmployee = await newEmployee.save();
    
    res.status(201).json({
      success: true,
      message: 'RFID employee created successfully',
      data: savedEmployee
    });
  } catch (error) {
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
    const updateData = req.body;
    
    // Check if RFID number is being updated and if it already exists
    if (updateData.rfidNumber) {
      const existingRfid = await RfidEmployee.findOne({ 
        rfidNumber: updateData.rfidNumber,
        _id: { $ne: id }
      });
      if (existingRfid) {
        return res.status(409).json({
          success: false,
          message: 'RFID number already exists'
        });
      }
    }
    
    // Check if Employee ID is being updated and if it already exists
    if (updateData.empId) {
      const existingEmpId = await RfidEmployee.findOne({ 
        empId: updateData.empId,
        _id: { $ne: id }
      });
      if (existingEmpId) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }
    
    const updatedEmployee = await RfidEmployee.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'RFID employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
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
    const deletedEmployee = await RfidEmployee.findByIdAndDelete(req.params.id);
    
    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'RFID employee deleted successfully',
      data: deletedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting RFID employee',
      error: error.message
    });
  }
});

// PATCH /api/rfid-employees/:id/status - Employee status change කරන්න
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
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
      return res.status(404).json({
        success: false,
        message: 'RFID Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message
    });
  }
});

module.exports = router;