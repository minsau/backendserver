var express = require('express');
var app = express();
var Medico = require('../models/medico');

var mdAutenticación = require('../middlewares/auth');

app.get('/', (req, res) => {
  var from = req.query.from || 0;
  from = Number(from);
  Medico.find({},'nombre img usuario hospital')
    .skip(from)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital', 'nombre img')
    .exec( (error, medicos) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando hospitals',
        error
      });
    } else {
      Medico.count({}, (err, total) => {
        res.status(200).json({
          ok: true,
          total,
          medicos
        });
      })
    }
  });
});

app.post('/', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    usuario: body.id_usuario,
    img: body.img,
    hospital: body.id_hospital
  });

  medico.save(( err, saved ) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error guardando medico',
        err
      });
    } else {
      res.status(201).json({
        ok: true,
        medico: saved
      });
    }
  });
});

// ====================================
// Actualizar medico
// ====================================

app.put('/:id', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var id = req.params.id;

  Medico.findById(id, ( err, medico ) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error buscando medico',
        err
      });
    } 
    
    if ( !medico ) {
      return res.status(400).json({
        ok: true,
        mensaje: `El medico con el ID ${id} no existe`,
        error: { message: 'No existe un medico con ese ID'}
      });
    }

    medico.nombre = body.nombre;
    medico.img = body.img;  
    medico.hospital = body.id_hospital;

    medico.save(( err, saved ) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error actualizando medico',
          err
        });
      } else {
        res.status(201).json({
          ok: true,
          medico: saved
        });
      }
    });

  });
});

// ====================================
// Borrar medico
// ====================================
app.delete('/:id', mdAutenticación.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, deleted) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando Medico',
        err
      });
    } else {
      res.status(200).json({
        ok: true,
        medico: deleted
      });
    }
  });
});
module.exports = app;