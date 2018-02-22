var app = require('http').createServer();
var io = module.exports.io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(app);

const PORT = process.env.PORT || 3231;

const SocketManager = require('./SocketManager');

io.on('connection', SocketManager);

app.listen(PORT, () => {
    console.log(`Connection to port: ${PORT}.`);
});
