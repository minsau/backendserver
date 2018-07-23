var express = require('express');
var app = express();
var Hospital = require('../models/hospital');

var mdAutenticación = require('../middlewares/auth');

app.get('/', (req, res) => {
  var from = req.query.from || 0;
  from = Number(from);
  Hospital.find({},'nombre img usuario')
    .skip(from)
    .limit(5)
    .populate('usuario', 'nombre email').exec( (error, hospitales) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando hospitals',
        error
      });
    } else {
      Hospital.count({}, (err, total) => {
        res.status(200).json({
          ok: true,
          total,
          hospitales
        });
      })
    }
  });
});

app.post('/', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: body.id_usuario,
    img: body.img,
  });

  hospital.save(( err, saved ) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error guardando hospital',
        err
      });
    } else {
      res.status(201).json({
        ok: true,
        hospital: saved
      });
    }
  });
});

// ====================================
// Actualizar hospital
// ====================================

app.put('/:id', mdAutenticación.verificaToken, (req, res) => {
  var body = req.body;
  var id = req.params.id;

  Hospital.findById(id, ( err, hospital ) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error buscando hospital',
        err
      });
    } 
    
    if ( !hospital ) {
      return res.status(400).json({
        ok: true,
        mensaje: `El hospital con el ID ${id} no existe`,
        error: { message: 'No existe un hospital con ese ID'}
      });
    }

    hospital.nombre = body.nombre;
    hospital.img = body.img;  

    hospital.save(( err, saved ) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error actualizando hospital',
          err
        });
      } else {
        res.status(201).json({
          ok: true,
          hospital: saved
        });
      }
    });

  });
});

// ====================================
// Borrar hospital
// ====================================
app.delete('/:id', mdAutenticación.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, deleted) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando hospital',
        err
      });
    } else {
      res.status(200).json({
        ok: true,
        hospital: deleted
      });
    }
  });
});

module.exports = app;