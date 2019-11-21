const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

//set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('public'));

//routes
app.get('/', (req, res) => {
    res.render('index')
});

var domain = process.env.DOMAIN ||'node-chat.faizanrupani.dev';
var options = {
    key: fs.readFileSync(path.resolve(__dirname, 'certificates/' + domain + '/certificate.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'certificates/' + domain + '//certificate.crt')),
};
console.log(options);

//app.listen(port, () => console.log(`Example app listening on port ${port}!`));
var server = https.createServer(options, app);
server.listen(port, domain, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at wss://%s:%s and host: %s', domain, port, host);
}).on('error', function(err) {
    if (err.errno === 'EADDRINUSE') {
        console.log('port busy');
    } else {
        console.log(err);
    }
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
