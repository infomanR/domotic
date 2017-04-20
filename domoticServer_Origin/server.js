var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var SerialPort = require('serialport');

mongoose.connect('mongodb://localhost/domoticDB');

var admin = require('./controllers/adminController');
var user = require('./controllers/usuarioController');

require('./config/config');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
	secret: 'mysecretsessionkey',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(flash());

app.use(expressValidator());

app.use(passport.initialize());
app.use(passport.session());

app.use(admin);
app.use(user);
/**Conexion con arduino**/
var myPort = new SerialPort("COM3", {
  baudrate: 9600,
  parser: SerialPort.parsers.readline("\n"),
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

myPort.on('open', onOpen);
myPort.on('data', onData);

var temp = 0;
var hum = 0;
var ilum = 0;

function onData(data){//datos recibidos del arduino
    var primero = data.split("/");
    var jsonObj = {
      "temp": primero[0],
      "hum": primero[1],
      "ilum": primero[2]
    }
    temp = jsonObj.temp;
    hum = jsonObj.hum;
    ilum = jsonObj.ilum;
}

setInterval(function(){
	var jsonObj = {
    	"temp": parseInt(temp),
    	"hum": parseInt(hum),
    	"ilum": parseInt(ilum)
  	}
  	io.sockets.emit('datoSensor', jsonObj);
}, 5000);

function onOpen(){
	console.log("Arduino conectado");
}

function writeData(data) {
    myPort.write(data);
}

io.on('connection', function(socket){//envia datos CLIENTE ---> SERVIDOR
  console.log('Usuario conectado: '+socket.id);
  socket.on('led1', function(msg){
    writeData(msg.uno);
  });
  socket.on('led2', function(msg){
    writeData(msg.uno);
  });
  socket.on('led3', function(msg){
    writeData(msg.uno);
  });
  socket.on('led4', function(msg){
    writeData(msg.uno);
  });
  socket.on('led5', function(msg){
    writeData(msg.uno);
  });
  socket.on('fan', function(msg){
    writeData(msg.uno);
  });
  socket.on('disconnect', function(){
    console.log('Usuario desconectado: '+socket.id);
  });
});


app.listen(8000, '127.0.0.1', function(){//localhost
	console.log('El servidor esta corriendo por el puerto 8000');
});