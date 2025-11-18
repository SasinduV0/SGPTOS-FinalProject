const express = require('express');
const router = express.Router();
const RfidEmployee = require('../models/RfidEmployee');

const ID_REGEX = /^E[1-9a-f]{3}$/;
const VALID_RFID_LIST = ['E9 EB 39 03', 'F5 A6 28 A1', 'E5 B7 9B A1', 'E5 CC 9B A1'];

// Helper functions
const isValidRfid = (rfid) => VALID_RFID_LIST.includes(rfid);
const trimAll = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v || '').trim()]));
const sendError = (res, code, message, extra = {}) => res.status(code).json({ success: false, message, ...extra });
const sendSuccess = (res, code, message, data = null) => res.status(code).json({ success: true, message, ...(data && { data }) });
const isValidMongoId = (id) => mongoose.Types.ObjectId.isValid(id);


// Debug log middleware (Request Tracking / Monitor)
router.use((req, _, next) => {
  console.log(`[RFID ${req.method}] ${req.path}`, req.body || {});
  next();
});

// Retrieve all RFID employees with optional search and status filters
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = ['rfidNumber', 'empName', 'empId'].map(f => ({ [f]: { $regex: search, $options: 'i' } }));
    }
    if (status) query.status = status;

  const employees = await RfidEmployee.find(query).sort({ createdAt: -1 });
  // Return the employees array directly as `data` so frontend components
  // that call `response.data.data.map(...)` receive an array (prevents
  // DataTable `data.map is not a function` errors).
  sendSuccess(res, 200, 'RFID employees fetched successfully', employees);
  } catch (e) {
    sendError(res, 500, 'Error fetching RFID employees', { error: e.message });
  }
});

// Fetch a single RFID employee by its MongoDB ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format to ensure it is a valid MongoDB ObjectId
    if (!isValidMongoId(id)) return sendError(res, 400, 'Invalid ID format');

    // Search for the employee record using the provided ID
    const employee = await RfidEmployee.findById(id);
    if (!employee) return sendError(res, 404, 'RFID Employee not found');

    sendSuccess(res, 200, 'RFID employee fetched successfully', item);
  } catch (err) {
    sendError(res, 500, 'Error fetching RFID employee', { error: err.message });
  }
});

// CREATE a new RFID Employee
router.post('/', async (req, res) => {
  try {
    const { rfidNumber, empName, empId, ...rest } = trimAll(req.body);

    if (!rfidNumber || !empName || !empId)
      return sendError(res, 400, 'RFID Number, Employee Name, and Employee ID are required');

    if (!isValidRfid(rfidNumber))
      return sendError(res, 400, 'Invalid RFID number. Please select from valid RFIDs.');

    if (!ID_REGEX.test(empId))
      return sendError(res, 400, 'empId format invalid. Example: E1a3');

    const duplicate = await RfidEmployee.findOne({
      $or: [{ rfidNumber }, { empId }]
    });

    if (duplicate)
      return sendError(res, 409, 'RFID number or Employee ID already exists');

    // Create new RFID employee entry
    const newEmployee = await RfidEmployee.create({
      rfidNumber,
      empName,
      empId,
      status: rest.status || 'ACTIVE',
      ...trimAll(rest)
    });

    sendSuccess(res, 201, 'RFID employee created successfully', newEmployee);
  } catch (err) {
    // Duplicate key error (unique fields)
    if (err.code === 11000)
      return sendError(res, 409, `${Object.keys(err.keyValue)[0]} already exists`);

    // Mongoose validation errors
    if (err.name === 'ValidationError')
      return sendError(res, 400, 'Validation error', {
        errors: Object.values(err.errors).map((v) => v.message)
      });

    // General server error
    sendError(res, 500, 'Error creating RFID employee', { error: err.message });
  }
});


// PUT route to update an existing RFID employee by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rfidNumber, empName, empId, ...rest } = trimAll(req.body);

    // Validate MongoDB ObjectId
    if (!isValidMongoId(id)) return sendError(res, 400, 'Invalid ID format');

    if (!rfidNumber || !empName || !empId)
      return sendError(res, 400, 'RFID Number, Employee Name, and Employee ID are required');

    // Check if employee exists
    const employee = await RfidEmployee.findById(id);
    if (!employee) return sendError(res, 404, 'RFID Employee not found');

    if (!isValidRfid(rfidNumber))
      return sendError(res, 400, 'Invalid RFID number');

    if (!ID_REGEX.test(empId))
      return sendError(res, 400, 'empId format invalid. Example: E1a3');

    const dup = await RfidEmployee.findOne({
      $or: [{ rfidNumber }, { empId }],
      _id: { $ne: id }
    });

    if (dup) return sendError(res, 409, 'RFID number or Employee ID already exists');

     // Update employee record in database
    const updated = await RfidEmployee.findByIdAndUpdate(
      id,
      {
        rfidNumber,
        empName,
        empId,
        status: rest.status || 'ACTIVE',
        ...trimAll(rest)
      },
      { new: true, runValidators: true }
    );

    if (!updated) return sendError(res, 404, 'RFID Employee not found');

    sendSuccess(res, 200, 'RFID employee updated successfully', updated);
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError')
      return sendError(res, 400, 'Validation error', {
        errors: Object.values(err.errors).map((v) => v.message)
      });

    sendError(res, 500, 'Error updating RFID employee', { error: err.message });
  }
});

// DELETE route to remove an RFID employee by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidMongoId(id)) return sendError(res, 400, 'Invalid ID');

    const deleted = await RfidEmployee.findByIdAndDelete(id);
    //no data in database
    if (!deleted) return sendError(res, 404, 'RFID Employee not found');

    sendSuccess(res, 200, 'RFID employee deleted successfully', deleted);
  } catch (err) {
    //server error
    sendError(res, 500, 'Error deleting RFID employee', { error: err.message });
  }
});

// ----------------- PATCH: Update Status -----------------
router.patch('/:id/status', async (req, res) => {
  try {
    // Get employee ID from URL
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status))
      return sendError(res, 400, 'Invalid status. Must be ACTIVE or INACTIVE');

    // Validate MongoDB ObjectId
    if (!isValidMongoId(id)) return sendError(res, 400, 'Invalid ID');

    const updated = await RfidEmployee.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) return sendError(res, 404, 'RFID Employee not found');

    sendSuccess(res, 200, 'Employee status updated successfully', updated);
  } catch (err) {
    sendError(res, 500, 'Error updating employee status', { error: err.message });
  }
});

module.exports = router;