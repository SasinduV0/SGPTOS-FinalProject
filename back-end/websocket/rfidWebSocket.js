const WebSocket = require('ws');
const { RFIDScan } = require('../models/iot');

class RFIDWebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/rfid-ws'
        });
        
        this.setupWebSocketServer();
        console.log('<-> RFID WebSocket server initialized on path: /rfid-ws');
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const clientIP = req.socket.remoteAddress;
            console.log(`-> ESP32 connected from: ${clientIP}`);
            
            // Send connection confirmation
            ws.send(JSON.stringify({
                type: 'connection',
                status: 'success',
                message: 'Connected to RFID WebSocket server',
                timestamp: Date.now()
            }));

            ws.on('message', async (data) => {
                try {
                    await this.handleMessage(ws, data);
                } catch (error) {
                    console.error('!! WebSocket message error:', error);
                    this.sendError(ws, 'Message processing failed', error.message);
                }
            });

            ws.on('close', (code, reason) => {
                console.log(`!! ESP32 disconnected: ${clientIP} - Code: ${code}, Reason: ${reason}`);
            });

            ws.on('error', (error) => {
                console.error('!! WebSocket error:', error);
            });
        });
    }

    async handleMessage(ws, data) {
        let message;
        
        try {
            message = JSON.parse(data.toString());
        } catch (error) {
            return this.sendError(ws, 'Invalid JSON format', error.message);
        }

        console.log('<> Received from ESP32:', message);

        switch (message.action) {
            case 'rfid_scan':
                await this.handleRFIDScan(ws, message.data);
                break;
            
            case 'ping':
                this.sendResponse(ws, 'pong', { timestamp: Date.now() });
                break;
            
            default:
                this.sendError(ws, 'Unknown action', `Action '${message.action}' not supported`);
        }
    }

    async handleRFIDScan(ws, scanData) {
        try {
            // Validate required fields
            const requiredFields = ['ID', 'Tag_UID', 'Station_ID', 'Time_Stamp'];
            const missingFields = requiredFields.filter(field => !scanData[field]);
            
            if (missingFields.length > 0) {
                return this.sendError(ws, 'Validation Error', `Missing fields: ${missingFields.join(', ')}`);
            }

            // Create new RFID scan document
            const newScan = new RFIDScan({
                ID: scanData.ID,
                Tag_UID: scanData.Tag_UID,
                Station_ID: scanData.Station_ID,
                Time_Stamp: parseInt(scanData.Time_Stamp)
            });

            // Save to MongoDB
            const savedScan = await newScan.save();
            
            console.log(`-> RFID scan saved: ${scanData.ID} - Station: ${scanData.Station_ID} - UID: ${scanData.Tag_UID}`);
            
            // Send success response
            this.sendResponse(ws, 'rfid_scan_success', {
                scanId: savedScan._id,
                ID: savedScan.ID,
                message: '<> RFID scan data saved successfully',
                timestamp: Date.now()
            });

            // Broadcast to other connected clients (for real-time dashboard)
            this.broadcastScanData(savedScan, ws);

        } catch (error) {
            if (error.code === 11000) {
                // Duplicate ID error
                this.sendError(ws, 'Duplicate Error', `Scan ID '${scanData.ID}' already exists`);
            } else {
                console.error('!! Database error:', error);
                this.sendError(ws, 'Database Error', 'Failed to save scan data');
            }
        }
    }

    sendResponse(ws, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: type,
                status: 'success',
                data: data,
                timestamp: Date.now()
            }));
        }
    }

    sendError(ws, errorType, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'error',
                status: 'error',
                error: {
                    type: errorType,
                    message: message
                },
                timestamp: Date.now()
            }));
        }
    }

    broadcastScanData(scanData, excludeWs) {
        const broadcastMessage = JSON.stringify({
            type: 'rfid_scan_broadcast',
            status: 'info',
            data: {
                ID: scanData.ID,
                Tag_UID: scanData.Tag_UID,
                Station_ID: scanData.Station_ID,
                Time_Stamp: scanData.Time_Stamp,
                createdAt: scanData.createdAt
            },
            timestamp: Date.now()
        });

        this.wss.clients.forEach((client) => {
            if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                client.send(broadcastMessage);
            }
        });
    }

    // Get connected clients count
    getConnectedClients() {
        return this.wss.clients.size;
    }

    // Close all connections
    closeAll() {
        this.wss.clients.forEach((client) => {
            client.close();
        });
    }
}

module.exports = RFIDWebSocketServer;
