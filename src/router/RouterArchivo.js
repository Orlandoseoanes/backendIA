const express = require('express');
const router = express.Router();
const Archivo = require('../model/modelArchivos'); 
const fs = require('fs'); // Importar el módulo fs
const xlsx = require('xlsx');
const path = require('path'); // Agregamos esta línea para importar el
const { obtenerDatosParaIA,ejecutarInteligenciaArtificial,ComenzarSimulacion,Simulacion } = require('../router/Funciones'); // Asegúrate de importar tus funciones correctamente
const fileUpload = require('express-fileupload');
////


/////

const uploadPath = path.join(__dirname, '..', '..', 'MEDIA');

router.use(fileUpload());

  // Ruta para subir un archivo
  router.post('/subir-archivo', async (req, res) => {
    try {
      // Verificar si se envió un archivo
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No se envió ningún archivo' });
      }
  
      const archivo = req.files.archivo; // Obtener el archivo desde la solicitud
      const nombreArchivo = archivo.name; // Obtener el nombre del archivo
      const ubicacion = path.join(uploadPath, nombreArchivo); // Obtener la ubicación donde se guardará el archivo
  
      // Mover el archivo al directorio de destino
      archivo.mv(ubicacion, function(err) {
        if (err) {
          console.error('Error al mover el archivo:', err);
          return res.status(500).json({ error: 'Error al mover el archivo' });
        }
        
        console.log('Archivo guardado correctamente en:', ubicacion);
        res.status(201).json({ ubicacion });
      });
    } catch (error) {
      console.error('Error al crear un nuevo archivo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  

  router.get('/obtener-archivo', async (req, res) => {
    try {
        // Obtener la lista de archivos en la carpeta MEDIA
        const archivosEnCarpeta = fs.readdirSync(path.join(__dirname, '..', '..', 'MEDIA'));

        // Filtrar los archivos para encontrar el archivo XLSX
        const archivoXLSX = archivosEnCarpeta.find(archivo => archivo.endsWith('.xlsx'));

        if (!archivoXLSX) {
            return res.status(404).json({ message: 'No se encontró ningún archivo XLSX en la carpeta MEDIA' });
        }

        // Construir la ruta completa del archivo XLSX
        const archivoPath = path.join(__dirname, '..', '..', 'MEDIA', archivoXLSX);

        // Leer y manipular el archivo XLSX
        const workbook = xlsx.readFile(archivoPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const datos = xlsx.utils.sheet_to_json(worksheet);

        // Crear el contenido del archivo de texto con los datos del Excel
        const contenidoArchivo = JSON.stringify(datos);

        // Ruta del archivo de texto
        const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'datos_excel.txt');

        // Escribir en el archivo de texto
        fs.writeFileSync(rutaArchivo, contenidoArchivo);

        // Devolver los datos del archivo como respuesta en formato JSON
        res.json({
            archivo: archivoXLSX,
            Patrones: xlsx.utils.decode_range(worksheet['!ref']).e.r,
            entradas: Object.keys(datos[0]).filter(key => key.startsWith('s')).length,
            salidas: Object.keys(datos[0]).filter(key => key.startsWith('m')).length,
            datos: datos
        });
    } catch (error) {
        console.error('Error al obtener y leer el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



  router.post("/traerdatos", async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const { rataAprendizaje, numIteraciones, errorMaximo } = req.body;

        // Crear el contenido del archivo de texto
        const contenidoArchivo = `Rata de aprendizaje: ${rataAprendizaje}\nNúmero de iteraciones: ${numIteraciones}\nError máximo permitido: ${errorMaximo}`;

        // Ruta del archivo de texto
        const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'datos.txt');

        // Escribir en el archivo de texto
        fs.writeFileSync(rutaArchivo, contenidoArchivo);

        // Enviar una respuesta al cliente
        res.status(200).json({ message: "Datos recibidos correctamente y guardados en el archivo datos.txt" });
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/Procesos", async (req, res) => {
  try {
      // Limpiar el archivo "error_iteracion.txt"
      const rutaArchivoErrorIteracion = path.join(__dirname, '..', '..', 'MEDIA', 'error_iteracion.txt');
      fs.writeFileSync(rutaArchivoErrorIteracion, '');

      const rutaCarpetaSimulacion = path.join(__dirname, '..', '..', 'MEDIA');
      const archivos = fs.readdirSync(rutaCarpetaSimulacion);
      const archivoExcel = archivos.find(archivo => archivo.endsWith('.xlsx'));
      const rutaArchivoExcel = path.join(rutaCarpetaSimulacion, archivoExcel);
  
      // Verificar si se encontró un archivo Excel
      if (!archivoExcel) {
        console.error('No se encontró ningún archivo Excel en la carpeta "Simulacion"');
      } else {
        // Eliminar el archivo Excel
        fs.unlinkSync(rutaArchivoExcel);
        console.log('Archivo Excel eliminado correctamente.');
      }




      // Obtener los datos para la inteligencia artificial
      const datosIA = obtenerDatosParaIA();

      // Verificar si se pudieron obtener los datos correctamente
      if (datosIA) {
          // Enviar los datos obtenidos como respuesta en formato JSON
          res.json(datosIA);
      } else {
          // Enviar un mensaje de error si ocurrió un problema al obtener los datos
          res.status(500).json({ error: 'Error al obtener los datos para la inteligencia artificial' });
      }
  } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});


router.get("/Solucion",async  (req,res)=>{
  try {
    // Obtener los datos necesarios para la inteligencia artificial
    const datosParaIA = obtenerDatosParaIA();
    
    // Verificar si se obtuvieron los datos correctamente
    if (datosParaIA) {
        // Ejecutar la inteligencia artificial con los datos obtenidos
        ejecutarInteligenciaArtificial(datosParaIA);
        res.status(200).json({ message: 'Inteligencia artificial ejecutada exitosamente.' });
    } else {
        res.status(500).json({ error: 'No se pudieron obtener los datos para la inteligencia artificial.' });
    }
} catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
}
  });

  router.get("/Exportardatos", async (req, res) => {
    try {
        // Ruta del archivo "error_iteracion.txt"
        const rutaArchivoErrorIteracion = path.join(__dirname, '..', '..', 'MEDIA', 'error_iteracion.txt');

        // Verificar si el archivo existe
        if (!fs.existsSync(rutaArchivoErrorIteracion)) {
            return res.status(404).json({ message: 'El archivo error_iteracion.txt no existe' });
        }

        // Leer el contenido del archivo
        const contenidoArchivo = fs.readFileSync(rutaArchivoErrorIteracion, 'utf8');

        // Dividir el contenido del archivo por líneas y convertirlo a un array
        const lineas = contenidoArchivo.split('\n');

        // Convertir las líneas a números y eliminar las líneas vacías
        const erroresIteracion = lineas.filter(linea => linea.trim() !== '').map(parseFloat);

        // Devolver los errores de iteración como respuesta en formato JSON
        res.json({ erroresIteracion });
    } catch (error) {
        console.error('Error al exportar los datos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post("/simulacion", async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivoExcel) {
      return res.status(400).json({ error: 'No se proporcionó un archivo' });
    }

    // Ruta del archivo XLSX
    const archivo = req.files.archivoExcel;
    const nombreArchivo = archivo.name;
    const rutaArchivo = path.join(__dirname, '..', '..', 'Simulacion', nombreArchivo);

    // Mover el archivo al directorio de simulación
    archivo.mv(rutaArchivo, function(err) {
      if (err) {
        console.error('Error al mover el archivo:', err);
        return res.status(500).json({ error: 'Error al mover el archivo' });
      }
      
      console.log('Archivo movido correctamente a:', rutaArchivo);

      // Convertir el archivo Excel subido a un archivo de texto

      // Enviar la ruta del archivo como respuesta
      res.json({ archivo: nombreArchivo });
    });
  } catch (error) {
    console.error('Error al realizar la simulación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});




router.get("/resultadoSimulacion", async (req, res) => {
  try {
      ComenzarSimulacion();
      console.log('La simulación se ha iniciado correctamente.');
      const respuesta = Simulacion();

     // Ruta completa del archivo Excel
    const rutaCarpetaSimulacion = path.join(__dirname, '..', '..', 'Simulacion');
    const archivos = fs.readdirSync(rutaCarpetaSimulacion);
    const archivoExcel = archivos.find(archivo => archivo.endsWith('.xlsx'));
    const rutaArchivoExcel = path.join(rutaCarpetaSimulacion, archivoExcel);

    // Verificar si se encontró un archivo Excel
    if (!archivoExcel) {
      console.error('No se encontró ningún archivo Excel en la carpeta "Simulacion"');
    } else {
      // Eliminar el archivo Excel
      fs.unlinkSync(rutaArchivoExcel);
      console.log('Archivo Excel eliminado correctamente.');
    }
      // Enviar una respuesta al cliente
      res.status(200).json({ message: 'La simulación se ha iniciado correctamente.', respuesta });
  } catch (error) {
      console.error('Error al realizar la simulación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});


  module.exports = router;


//funciones



