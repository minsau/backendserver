var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario');

var mdAutenticación = require('../middlewares/auth');

// Rutas
app.get('/', (req, res) => {
  var from = req.query.from || 0;
  from = Number(from);
  Usuario.find({},'nombre email role img')
    .skip(from)
    .limit(5)
    .exec( (error, usuarios) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando usuarios',
        error
      });
    } else {
      Usuario.count({}, (err, total) => {
        res.status(200).json({
          ok: true,
          total,
          usuarios
        });
      })
    }
  });
});

app.post('/', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save(( err, saved ) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error guardando usuarios',
        err
      });
    } else {
      res.status(201).json({
        ok: true,
        usuario: saved
      });
    }
  });
});

app.put('/:id', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var id = req.params.id;

  Usuario.findById(id, ( err, usuario ) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error buscando usuarios',
        err
      });
    } 
    
    if ( !usuario ) {
      return res.status(400).json({
        ok: true,
        mensaje: `El usuario con el ID ${id} no existe`,
        error: { message: 'No existe un usuario con ese ID'}
      });
    }

    usuario.nombre = body.nombre;
    usuario.role = body.role;
    usuario.email = body.email;

    usuario.save(( err, saved ) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error actualizando usuario',
          err
        });
      } else {
        res.status(201).json({
          ok: true,
          usuario: saved
        });
      }
    });

  });
});

// ====================================
// Borrar usuario
// ====================================

app.delete('/:id', mdAutenticación.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, deleted) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando usuario',
        err
      });
    } else {
      res.status(200).json({
        ok: true,
        usuario: deleted
      });
    }
  });
});

module.exports = app;