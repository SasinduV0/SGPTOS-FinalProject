const express = require('express');
const router = express.Router();
const RfidEmployee = require('../models/RfidEmployee');
const ProductRfid = require('../models/ProductRfid');

// All valid RFID numbers in your system
const allValidRfids = [
  'E9 EB 39 03', 'F5 A6 28 A1', 'E5 B7 9B A1', 'E5 CC 9B A1', '36 22 C1 01',
  '83 9D 21 2D', '92 CD 0C 01', '16 31 0D 01', '73 EA 4B 16', '92 CC 0C 01'
];

// GET /api/valid-rfids - Get available (unassigned) RFID numbers
router.get('/', async (req, res) => {
  try {
    const { type, excludeId } = req.query;

    // Get all assigned RFIDs from both collections
    const employeeRfids = await RfidEmployee.find({}, 'rfidNumber');
    const productRfids = await ProductRfid.find({}, 'rfidNumber');

    // Create set of assigned RFID numbers
    const assignedRfids = new Set([
      ...employeeRfids.map(e => e.rfidNumber?.trim()),
      ...productRfids.map(p => p.rfidNumber?.trim())
    ]);

    // If editing (excludeId provided), get the current RFID to include it
    let currentRfid = null;
    if (excludeId && type) {
      try {
        if (type === 'employee') {
          const employee = await RfidEmployee.findById(excludeId);
          currentRfid = employee?.rfidNumber?.trim();
        } else if (type === 'product') {
          const product = await ProductRfid.findById(excludeId);
          currentRfid = product?.rfidNumber?.trim();
        }
      } catch (err) {
        console.error('Error fetching current RFID:', err);
      }
    }

    // Filter available RFIDs
    const availableRfids = allValidRfids.filter(rfid => {
      const trimmedRfid = rfid.trim();
      // Include if not assigned OR if it's the current RFID being edited
      return !assignedRfids.has(trimmedRfid) || trimmedRfid === currentRfid;
    });

    res.status(200).json({ 
      success: true, 
      data: availableRfids,
      total: allValidRfids.length,
      available: availableRfids.length,
      assigned: allValidRfids.length - availableRfids.length
    });
  } catch (err) {
    console.error('GET /valid-rfids error', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching valid RFIDs', 
      error: err.message 
    });
  }
});

module.exports = router;