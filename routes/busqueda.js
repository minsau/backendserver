var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/specific/:tabla/:busqueda', (req, res) => {
  var search = req.params.busqueda;
  var tabla = req.params.tabla;
  var regex = new RegExp(search, 'i');
  var promesa;
  switch(tabla){
    case 'usuarios':
      promesa = busquedaUsuarios(regex);
    break;
    case 'medicos':
      promesa = busquedaMedicos(regex);
    break;
    case 'hospitales':
      promesa = busquedaHospitales(regex);
    break;
    default:
      return res.status(400).json(
        {
          ok: false,
          mensaje: 'Los tipos de busueda son: hospitales, medicos, usuarioss',
          error: {
            message: 'Tipo de colección no valido'
          }
        }
      );
    break;
  }

  promesa.then( data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

// Rutas

// ====================================
// Busqueda por collección
// ====================================

app.get('/specific/:table/:search', (req, res) => {
  var table = req.params.table;
  var search = req.params.search;
  var regex = new RegExp(search, 'i');
  var promesa = null;
  switch(table){
    case 'medicos':
      promesa = busquedaMedicos(regex);
      break;
    case 'usuarios':
      promesa = busquedaUsuarios(regex);
      break;
    case 'hospitales':
      promesa = busquedaHospitales(regex);
      break;
  }

  promesa.then( data => {
    res.status(200).json({
      ok: true,
      mensaje: 'Petición realizada correctamente',
      data
    });
  });
});

// ====================================
// Busqueda en todas las tablas
// ====================================

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
    Usuario.find({}, 'nombre email')
    .or([{ nombre: regex }, { email: regex }])
    .exec((err, usuarios) => {
      if(err) { reject(err); }
      resolve(usuarios);
    })
  });
}

module.exports = app;