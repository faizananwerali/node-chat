const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 443;
const CERTIFICATE_DOMAIN = process.env.CERTIFICATE_DOMAIN ||'node-chat.faizanrupani.dev';

//set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
var options = {
    key: fs.readFileSync(path.resolve(__dirname, 'certificates/' + CERTIFICATE_DOMAIN + '/certificate.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'certificates/' + CERTIFICATE_DOMAIN + '/certificate.crt')),
};

app.use(express.static('public', options));

//routes
app.get('/', (req, res) => {
    res.render('index')
});

var DOMAIN = process.env.DOMAIN ||'node-chat-faizan.herokuapp.com';
//app.listen(port, () => console.log(`Example app listening on port ${port}!`));
/*var server = https.createServer(options, app);
server.listen(port, DOMAIN, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at wss://%s:%s and domain: %s', host, port, domain);
}).on('error', function(err) {
    if (err.errno === 'EADDRINUSE') {
        console.log('port busy');
    } else {
        console.log(err);
    }
});*/
var server = app.listen(port, DOMAIN, function () {
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
