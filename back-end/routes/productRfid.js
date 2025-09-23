// routes/productRfid.js
const express = require('express');
const router = express.Router();
const ProductRfid = require('../models/ProductRfid');
const mongoose = require('mongoose');

// Debug middleware
router.use((req, res, next) => {
  console.log(`ProductRfid Route: ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  next();
});

// GET /api/product-rfids - list with optional search, unit, workplace, status
router.get('/', async (req, res) => {
  try {
    const { search, unit, workplace, status } = req.query;
    const query = {};

    if (search) {
      // search across rfidNumber, unit, workplace (case-insensitive)
      query.$or = [
        { rfidNumber: { $regex: search, $options: 'i' } }
        
      ];
    }
    if (unit && unit !== 'All Units') query.unit = unit;
    if (workplace && workplace !== 'All Workplaces') query.workplace = workplace;
    if (status) query.status = status;

    const items = await ProductRfid.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Product RFIDs fetched', data: items, count: items.length });
  } catch (err) {
    console.error('GET /product-rfids error', err);
    res.status(500).json({ success: false, message: 'Error fetching product RFIDs', error: err.message });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const item = await ProductRfid.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Product RFID not found' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error('GET single error', err);
    res.status(500).json({ success: false, message: 'Error fetching item', error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { rfidNumber, unit, workplace, status } = req.body;

    // Basic required checks
    if (!rfidNumber) {
      return res.status(400).json({ success: false, message: 'RFID number is required' });
    }

    const trimmed = String(rfidNumber || '').trim();

    // validate format (exactly 8 digits)
    if (!/^[0-9]{8}$/.test(trimmed)) {
      return res.status(400).json({ success: false, message: 'RFID must be exactly 8 digits' });
    }

    // check duplicate
    const exists = await ProductRfid.findOne({ rfidNumber: trimmed });
    if (exists) return res.status(409).json({ success: false, message: 'RFID already exists' });

    const newItem = new ProductRfid({
      rfidNumber: trimmed,
      unit: String(unit || '').trim(),
      workplace: String(workplace || '').trim(),
      status: status || 'ACTIVE'
    });

    const saved = await newItem.save();
    res.status(201).json({ success: true, message: 'Product RFID created', data: saved });
  } catch (err) {
    console.error('POST /product-rfids error', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate key', details: err.keyValue });
    }
    res.status(500).json({ success: false, message: 'Error creating product RFID', error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rfidNumber, unit, workplace, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    if (!rfidNumber) {
      return res.status(400).json({ success: false, message: 'RFID number is required' });
    }

    const trimmed = String(rfidNumber || '').trim();
    if (!/^[0-9]{8}$/.test(trimmed)) {
      return res.status(400).json({ success: false, message: 'RFID must be exactly 8 digits' });
    }

    const item = await ProductRfid.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Product RFID not found' });

    // check duplicate excluding current
    const dup = await ProductRfid.findOne({ rfidNumber: trimmed, _id: { $ne: id } });
    if (dup) return res.status(409).json({ success: false, message: 'RFID already exists in another record' });

    item.rfidNumber = trimmed;
    item.unit = String(unit || '').trim();
    item.workplace = String(workplace || '').trim();
    item.status = status || item.status;

    const updated = await item.save();
    res.status(200).json({ success: true, message: 'Product RFID updated', data: updated });
  } catch (err) {
    console.error('PUT /product-rfids error', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    res.status(500).json({ success: false, message: 'Error updating product RFID', error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const deleted = await ProductRfid.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product RFID not found' });
    res.status(200).json({ success: true, message: 'Product RFID deleted', data: deleted });
  } catch (err) {
    console.error('DELETE error', err);
    res.status(500).json({ success: false, message: 'Error deleting product RFID', error: err.message });
  }
});

// PATCH /:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const updated = await ProductRfid.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Product RFID not found' });
    res.status(200).json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    console.error('PATCH status error', err);
    res.status(500).json({ success: false, message: 'Error updating status', error: err.message });
  }
});

module.exports = router;
