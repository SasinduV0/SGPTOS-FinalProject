const express = require('express');
const mongoose = require('mongoose');
const ProductRfid = require('../models/ProductRfid');
const router = express.Router();

// --- Helpers ---
const VALID_RFID_LIST = ['36 22 C1 01','83 9D 21 2D','92 CD 0C 01','16 31 0D 01','73 EA 4B 16','92 CC 0C 01'];

const sendError = (res, code, msg, extra={}) => res.status(code).json({ success: false, message: msg, ...extra });
const isValidId = id => mongoose.Types.ObjectId.isValid(id);

// --- Debug Middleware ---
router.use((req, _, next) => {
  console.log(`[ProductRfid] ${req.method} ${req.path}`, req.body);
  next();
});

// --- GET All ---
router.get('/', async (req, res) => {
  try {
    const { search, unit, workplace, status } = req.query;
    const query = {
      // If "search" exists, filter by RFID number using a case-insensitive regex search
      ...(search && { rfidNumber: { $regex: search, $options: 'i' } }),
      ...(unit && unit !== 'All Units' && { unit }),
      ...(workplace && workplace !== 'All Workplaces' && { workplace }),
      ...(status && { status })
    };

    // Fetch all RFID records from the database that match the query(short descending order)

    const data = await ProductRfid.find(query).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Fetched successfully', data, count: data.length });
  } catch (err) {
    sendError(res, 500, 'Error fetching RFIDs', { error: err.message });
  }
});

// Route to fetch a single RFID record by its unique ID
router.get('/:id', async (req, res) => {

  const { id } = req.params;
  // Check if the ID is a valid MongoDB ObjectId
  if (!isValidId(id)) return sendError(res, 400, 'Invalid ID format');
  const item = await ProductRfid.findById(id);
  if (!item) return sendError(res, 404, 'Not found');

  // If the item is found
  res.json({ success: true, data: item });
});

// // Route to create a new RFID record with validation and duplicate check
router.post('/', async (req, res) => {
  try {
    const { rfidNumber, unit, workplace, status } = req.body;
    const trimmed = String(rfidNumber || '').trim();
    if (!trimmed) return sendError(res, 400, 'RFID number is required');
    if (!VALID_RFID_LIST.includes(trimmed)) return sendError(res, 400, 'Invalid RFID number');

    const exists = await ProductRfid.findOne({ rfidNumber: trimmed });
    if (exists) return sendError(res, 409, 'RFID already assigned');

    const newItem = await ProductRfid.create({
      rfidNumber: trimmed,
      unit: unit?.trim(),
      workplace: workplace?.trim(),
      status: status || 'ACTIVE'
    });

    //if Created successfully
    res.status(201).json({ success: true, message: 'Created successfully', data: newItem });
  } catch (err) {
    sendError(res, 500, 'Error creating RFID', { error: err.message });
  }
});

// update existing record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rfidNumber, unit, workplace, status } = req.body;

    if (!isValidId(id)) return sendError(res, 400, 'Invalid ID format');
    const trimmed = String(rfidNumber || '').trim();
    if (!trimmed) return sendError(res, 400, 'RFID number required');
    if (!VALID_RFID_LIST.includes(trimmed)) return sendError(res, 400, 'Invalid RFID number');

    //Duplicate check
    const dup = await ProductRfid.findOne({ rfidNumber: trimmed, _id: { $ne: id } });
    if (dup) return sendError(res, 409, 'RFID exists in another record');

    const updated = await ProductRfid.findByIdAndUpdate(
      id,     // The ID of the record we want to update
      { rfidNumber: trimmed, unit: unit?.trim(), workplace: workplace?.trim(), status },
      { new: true, runValidators: true }
    );
    if (!updated) return sendError(res, 404, 'Not found');

    res.json({ success: true, message: 'Updated successfully', data: updated });
  } catch (err) {
    sendError(res, 500, 'Error updating RFID', { error: err.message });
  }
});

// --- DELETE a single RFID record ---
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate the ID format before processing
  if (!isValidId(id)) return sendError(res, 400, 'Invalid ID');

  const deleted = await ProductRfid.findByIdAndDelete(id);

  if (!deleted) return sendError(res, 404, 'Not found');
  res.json({ success: true, message: 'Deleted successfully', data: deleted });
});

// --- PATCH: Update only the status field of an RFID record ---
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate allowed status values
  if (!['ACTIVE', 'INACTIVE'].includes(status)) return sendError(res, 400, 'Invalid status');
  if (!isValidId(id)) return sendError(res, 400, 'Invalid ID');

  // Update only the status field and return the updated document
  const updated = await ProductRfid.findByIdAndUpdate(id, { status }, { new: true });
  
  if (!updated) return sendError(res, 404, 'Not found');
  res.json({ success: true, message: 'Status updated', data: updated });
});

module.exports = router;
