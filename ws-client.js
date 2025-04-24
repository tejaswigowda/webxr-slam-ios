const WebSocket = require('ws');
let ws, reconnectInterval = 1000;

function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return;
    }
    ws = new WebSocket('ws://127.0.0.1:3000/set');

    ws.on('open', function open() {
        console.log('Connected to the server');
        ws.send('Hello from the client!');
    });

    ws.on('message', function incoming(data) {
        console.log('Received from server:', data.toString());
        if (data.toString() === 'SERVER CLOSED') {
            console.log('Server closed');
            ws.close();
        }
    });

    ws.on('close', function close() {
        ws = null; 
        console.log('Attempting to reconnect...');
    });

    ws.on('error', function error(err) {
        ws.close();
        console.error('WebSocket error:', err);
    });
}

connect(); setInterval(connect, reconnectInterval);

setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('Hello from the client at ' + new Date().toLocaleTimeString());
    }
}, 1000/30);