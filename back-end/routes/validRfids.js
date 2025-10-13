const express = require('express');
const router = express.Router();

//Mock valid RFID numbers
const validRfids = [
  '12345678', '23456789', '34567890', '45678901',
  '56789012', '67890123', '78901234', '89012345'
];

// GET /api/valid-rfids - Get available RFID numbers
router.get('/', async (req, res) => {
  try {
    // You can modify this to fetch from your actual RFID database/source
    res.status(200).json({ 
      success: true, 
      data: validRfids 
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