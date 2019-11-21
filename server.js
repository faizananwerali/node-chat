const express = require('express');
const app = express();
const port = process.env.PORT || 443;

//set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('public'));

//routes
app.get('/', (req, res) => {
    res.render('index')
});

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at wss://%s:%s', host, port);
});

//socket.io instantiation
const socket_io = require("socket.io");
const io = socket_io(server);

//listen on every connection
io.on('connection', (socket) => {
    console.log('New user connected');

    //default username
    socket.username = "Anonymous";

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username;
    });

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    });

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username : socket.username});
    });
});
