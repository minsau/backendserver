// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

var Reset = "\x1b[0m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";

// Conexión base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
  if (err) throw err;
  console.log(`Base de datos - ${FgGreen}%s${Reset}`, 'online');
});

// Routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/usuarios');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospitales');
var medicoRoutes = require('./routes/medicos');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/usuario', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/', appRoutes);


//Escuchar peticiones
app.listen(3000, () => {
  console.log(`Express server port 3000 - ${FgGreen}%s${Reset}`, 'online');
});