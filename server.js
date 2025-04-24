const express = require('express');
const app = express();
const server = require('http').Server(app);
const url = require('url');

const WebSocket = require('ws');

const port = 3000;

const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });


// camera websocket
wss1.on('connection', function connection(ws) {
  
  if (ws._socket.setNoDelay) {
    ws._socket.setNoDelay(true);
  }
    
  ws.on('message', function incoming(message) {
    console.log('received '+ message);
    wss2.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// webbrowser websocket
wss2.on('connection', function connection(ws) {
  if (ws._socket.setNoDelay) {
    ws._socket.setNoDelay(true);
  }
  ws.on('message', function incoming(message) {
  	// nothing here should be received
    console.log('received wss2: %s', message);
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/set') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/get') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

app.get("/", function (req, res) {
    res.redirect("index.html")
});

app.get("/numberofclients", function (req, res) {
    var numberofclient = wss2.clients.size;
    res.writeHead(200, {'Content-Type': 'text/plain'}); // send response header
   res.end(numberofclient.toString()); // send response body
});

// cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + '/docs'));

server.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})

