var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.use(fileUpload());
// Rutas
app.put('/:tipo/:id', (req, res) => {
  var id = req.params.id;
  var tipo = req.params.tipo;
  var validTypes = ['medicos', 'hospitales', 'usuarios'];

  if(validTypes.indexOf(tipo) < 0){
    res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección no valida',
      errors: {
        message: "Las colecciones validas son: " + validTypes.join(', ')
      }
    });
  }

  if(!req.files){
    res.status(400).json({
      ok: false,
      mensaje: 'No ha seleccionado nada',
      errors: {
        message: "Debe seleccionar un archivo"
      }
    });
  }

  var file = req.files.imagen;
  var nameSplitted = file.name.split('.');
  var extension = nameSplitted[nameSplitted.length - 1];
  var validExtensions = ['png', 'gif', 'jpg', 'jpeg'];
  
  if(validExtensions.indexOf(extension) < 0){
    res.status(400).json({
      ok: false,
      mensaje: 'Extension no valida',
      errors: {
        message: "Las extensiones validas son: " + validExtensions.join(', ')
      }
    });
  }

  var fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
  var path = `./uploads/${ tipo }/${fileName}`;
  file.mv(path, err => {
    if(err){
      res.status(400).json({
        ok: false,
        mensaje: 'No se pudo mover el archivo',
        errors: {
          message: "Hubo un error al intentar mover el archivo"
        }
      });
    }
    console.log(id);
    uploadByType(tipo, id, fileName, res);
  });
});

function uploadByType(type, id, fileName, res){
  switch(type){
    case 'medicos':
      Medico.findById(id, (err, medico) => {
        var oldPath = './uploads/medicos/' + medico.img;
        if(fs.existsSync(oldPath)){
          fs.unlink(oldPath);
        }
        medico.img = fileName;
        medico.save( (err, medicoUpdated) => {
          return res.status(200).json({
            ok: true,
            mensaje: 'Imagen de medico actualizada',
            medico: medicoUpdated
          });
        });
      })
    break;
    case 'hospitales':
      Hospital.findById(id, (err, hospital) => {
        var oldPath = './uploads/hospitales/' + hospital.img;
        if(fs.existsSync(oldPath)){
          fs.unlink(oldPath);
        }
        hospital.img = fileName;
        hospital.save( (err, hospitalUpdated) => {
          return res.status(200).json({
            ok: true,
            mensaje: 'Imagen de hospital actualizada',
            hospital: hospitalUpdated
          });
        });
      });
    break;
    case 'usuarios':
      Usuario.findById(id, (err, usuario) => {
        var oldPath = './uploads/usuarios/' + usuario.img;
        if(fs.existsSync(oldPath)){
          fs.unlink(oldPath);
        }
        usuario.img = fileName;
        usuario.save( (err, usuarioUpdated) => {
          return res.status(200).json({
            ok: true,
            mensaje: 'Imagen de usuario actualizada',
            usuario: usuarioUpdated
          });
        });
      });
    break;
  }
}

module.exports = app;