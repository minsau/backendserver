var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('./../config/config').SEED;
var CLIENT_ID = require('./../config/config').CLIENT_ID;
var {OAuth2Client} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);



var app = express();
var Usuario = require('../models/usuario');


async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

app.post('/google', async (req, res) => {
  var token = req.body.token;
  var googleUser = await verify(token)
    .catch(
      e => {
        return res.status(403).json({
          ok: false,
          mensaje: 'Token no valido'
        });
      }
    );

  Usuario.findOne({email: googleUser.email}, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuarios',
        err
      });
    } 

    if(usuario){
      if(!usuario.google) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Metodo de autenticación incorrecto',
          err
        });
      } else {
        var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400});
        return res.status(200).json({
          ok: true,
          usuario,
          token,
          id: usuario._id
        });
      }
    } else {
      var usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = '.-.-.-.-.-.-.-.-.-.s';

      usuario.save((err, usuarioSaved) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo crear el usuario',
            err
          });
        } 
        var token = jwt.sign({ usuarioSaved }, SEED, { expiresIn: 14400});
          return res.status(200).json({
            ok: true,
            usuario: usuarioSaved,
            token,
            id: usuario._id
          });
      });
    }
  });
});


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