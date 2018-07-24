var express = require('express');
var fileupload = require('express-fileupload');
var app = express();

app.use(fileupload());

// ====================================
// Subir archivos al servidor
// ====================================
app.put('/', (req, res) => {
  if( !req.files ){
    return res.status(400).json({
      ok: false,
      mensaje: 'Error subiendo archivo',
      errors: {message: 'No seleccionó ninguna imagen'}
    });
  }

  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];
  if( extensionesValidas.indexOf(extensionArchivo) === -1) {
    res.status(400).json({
      ok: true,
      mensaje: 'Extensión no valida',
      errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ')}
    });
  }

  res.status(200).json({
    ok: true,
    mensaje: 'Petición realizada correctamente'
  });
});

module.exports = app;