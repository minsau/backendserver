var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('./../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
  var body = req.body;
  Usuario.findOne({email: body.email }, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuarios',
        err
      });
    } 

    if(!usuario){
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        err
      });
    }

    if( !bcrypt.compareSync(body.password, usuario.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        err
      });
    } else {
      usuario.password = '';
      var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400});
      return res.status(200).json({
        ok: true,
        token,
        id: usuario._id
      });
    }
  });
});

module.exports = app;