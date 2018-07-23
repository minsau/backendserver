var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas
app.get('/all/:busqueda', (req, res) => {
  var search = req.params.busqueda;
  var regex = new RegExp(search, 'i');
  Promise.all([
    busquedaHospitales(regex), 
    busquedaMedicos(regex), 
    busquedaUsuarios(regex)]).then( data => {
      res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente',
        hospitales: data[0],
        medicos: data[1],
        usuarios: data[2]
      });
  });
});

function busquedaHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex }, (err, hospitales) => {
      if(err) { reject(err); }
      resolve(hospitales);
    })
  });
}

function busquedaMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex }, (err, medicos) => {
      if(err) { reject(err); }
      resolve(medicos);
    })
  });
}

function busquedaUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({ nombre: regex }, (err, usuarios) => {
      if(err) { reject(err); }
      resolve(usuarios);
    })
  });
}

module.exports = app;