var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
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
    res.status(200).json({
      ok: true,
      mensaje: 'Petición realizada correctamente'
    });
  });
});

module.exports = app;