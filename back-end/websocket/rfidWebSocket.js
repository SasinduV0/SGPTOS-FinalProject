const WebSocket = require("ws");
const { RFIDTagScan, GarmentDefects } = require("../models/iot"); // Updated import
const Station = require("../models/Station"); // Import Station model

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
              Station_Number: data.data.Station_Number || 0,
              Line_Number: data.data.Line_Number,
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
          
          else if (data.action === 'defect_scan') {
            // Handle defect data from ESP32
            const { ID, Section, Type, Subtype, Tag_UID, Station_ID, Time_Stamp } = data.data;

            // Create new defect entry
            const newDefectEntry = { Section, Type, Subtype };

            // Try to find existing garment defects document
            let garmentDefects = await GarmentDefects.findOne({ Tag_UID });

            if (garmentDefects) {
              // Check if this section-subtype combination already exists
              const existingDefect = garmentDefects.Defects.find(
                defect => defect.Section === Section && defect.Subtype === Subtype
              );

              if (existingDefect) {
                // Send duplicate error response
                ws.send(JSON.stringify({
                  type: 'defect_scan_error',
                  status: 'error',
                  error: {
                    type: 'Duplicate',
                    message: 'Defect already registered for this section-subtype combination'
                  }
                }));
                console.log(`Duplicate defect rejected: ${Tag_UID} - Section:${Section} Subtype:${Subtype}`);
                return;
              }

              // Add new defect to existing document and update timestamp
              garmentDefects.Defects.push(newDefectEntry);
              garmentDefects.Time_Stamp = Time_Stamp;
              await garmentDefects.save();

              console.log(`Defect added to existing garment: ${Tag_UID} - Total defects: ${garmentDefects.Defects.length}`);
            } else {
              // Create new garment defects document
              garmentDefects = new GarmentDefects({
                ID, // Use the scan ID from first defect
                Tag_UID,
                Station_ID,
                Defects: [newDefectEntry],
                Time_Stamp
              });

              await garmentDefects.save();
              console.log(`New garment defects created: ${Tag_UID} - First defect recorded`);
            }

            // Send success response
            ws.send(JSON.stringify({
              type: 'defect_scan_success',
              status: 'success',
              data: {
                garmentId: garmentDefects._id,
                totalDefects: garmentDefects.Defects.length,
                newDefect: newDefectEntry,
                message: 'Defect recorded successfully'
              }
            }));

            // Broadcast to all connected clients (for real-time dashboard)
            this.wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_defect',
                  data: {
                    garmentDefects,
                    newDefect: newDefectEntry
                  }
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
