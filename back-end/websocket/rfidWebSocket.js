const WebSocket = require("ws");
const { RFIDTagScan } = require("../models/iot"); // Updated import

class RFIDWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server: server,
      path: '/rfid-ws'
    });

    console.log('-> WebSocket server available at: ws://localhost:8000/rfid-ws');
    console.log('-> Ready to receive RFID data from ESP32');

    this.wss.on('connection', (ws) => {
      console.log('ESP32 client connected to WebSocket');
      
      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'success',
        message: 'WebSocket connected successfully'
      }));

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.action === 'rfid_scan') {
            // Save RFID scan data to MongoDB using new model
            const newScan = new RFIDTagScan({
              ID: data.data.ID,
              Tag_UID: data.data.Tag_UID,
              Station_ID: data.data.Station_ID,
              Time_Stamp: data.data.Time_Stamp
            });

            const savedScan = await newScan.save();
            
            // Send success response
            ws.send(JSON.stringify({
              type: 'rfid_scan_success',
              status: 'success',
              data: {
                scanId: savedScan._id,
                message: 'RFID scan data saved successfully'
              }
            }));

            console.log(`RFID scan saved: ${data.data.ID} - Station: ${data.data.Station_ID}`);
            
            // Broadcast to all connected clients (for real-time dashboard)
            this.wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_scan',
                  data: savedScan
                }));
              }
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          
          // Send error response
          ws.send(JSON.stringify({
            type: 'error',
            status: 'error',
            error: {
              type: error.name,
              message: error.message
            }
          }));
        }
      });

      ws.on('close', () => {
        console.log('ESP32 client disconnected from WebSocket');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }
}

module.exports = RFIDWebSocketServer;
