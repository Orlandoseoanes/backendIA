const { Console } = require('console');
const fs = require('fs');
const path = require('path');
const xlsx =require("xlsx");

function crearMatrizEntradasSalidas(entradas, salidas) {
    // Inicializar la matriz con las dimensiones correctas
    const matriz = [];
    for (let i = 0; i < entradas; i++) {
        matriz[i] = [];
        for (let j = 0; j < salidas; j++) {
            const valorAleatorio = parseFloat((Math.random() * 2 - 1).toFixed(3)); // Generar valor aleatorio entre -1 y 1 con solo 3 decimales
            matriz[i][j] = valorAleatorio;
        }
    }

    // Convertir la matriz a una cadena de texto
    const matrizString = matriz.map(row => row.join(',')).join('\n');

    // Ruta del archivo de texto
    const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'matriz.txt');

    // Escribir la matriz en el archivo de texto
    fs.writeFileSync(rutaArchivo, matrizString);

    console.log('Matriz de entradas y salidas guardada correctamente en el archivo:', rutaArchivo);

    return matriz;
}

function calcularVectorUmbral(salidas) {
    const vectorUmbral = [];
    for (let i = 0; i < salidas; i++) {
        const valorAleatorio = (Math.random() * 2 - 1).toFixed(3); // Generar valor aleatorio y limitar a 3 decimales
        vectorUmbral.push(parseFloat(valorAleatorio)); // Agregar valor al vector de umbrales
    }

    // Ruta del archivo de texto
    const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'umbrales.txt');

    // Escribir el vector en el archivo de texto
    fs.writeFileSync(rutaArchivo, JSON.stringify(vectorUmbral));

    console.log('Vector umbral guardado correctamente en el archivo:', rutaArchivo);

    return vectorUmbral;
}
  
  function leerDatosComoVariablesGlobales() {
    try {
        // Ruta del archivo de texto
        const rutaArchivo = 'MEDIA/datos.txt';
  
        // Leer el contenido del archivo de texto
        const contenidoArchivo = fs.readFileSync(rutaArchivo, 'utf-8');
        
        // Separar el contenido en líneas
        const lineas = contenidoArchivo.split('\n');
        
        // Iterar sobre cada línea y procesar los datos
        let rataAprendizaje, numIteraciones, errorMaximo;
        lineas.forEach(linea => {
            const partes = linea.split(':');
            const clave = partes[0].trim();
            const valor = partes[1].trim();
            if (clave === 'Rata de aprendizaje') {
                rataAprendizaje = parseFloat(valor);
            } else if (clave === 'Número de iteraciones') {
                numIteraciones = parseInt(valor);
            } else if (clave === 'Error máximo permitido') {
                errorMaximo = parseFloat(valor);
            }
        });

        // Devolver las variables
        return { rataAprendizaje, numIteraciones, errorMaximo };
    } catch (error) {
        console.error('Error al leer los datos como variables globales desde el archivo:', error);
        return null;
    }
}




// Función para obtener los datos necesarios para la inteligencia artificial
function obtenerDatosParaIA() {
    try {
        const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'datos_excel.txt');
        if (!fs.existsSync(rutaArchivo)) {
            throw new Error('El archivo de datos no existe');
        }
        const contenidoArchivo = fs.readFileSync(rutaArchivo, 'utf-8');
        const datos = JSON.parse(contenidoArchivo);

        // Verificar si se obtuvieron datos válidos
        if (!datos || !Array.isArray(datos) || datos.length === 0) {
            throw new Error('Los datos obtenidos del archivo no son válidos');
        }

        // Obtener la cantidad de patrones, entradas y salidas
        const Patrones = datos.length;
        let entradas = 0;
        let salidas = 0;
        const primerPatron = datos[0];
        for (let key in primerPatron) {
            if (key.startsWith('s')) {
                entradas++;
            } else if (key.startsWith('m')) {
                salidas++;
            }
        }

        // Calcular matriz de entradas y salidas
        const matrizEntradasSalidas = crearMatrizEntradasSalidas(entradas, salidas);

        // Calcular vector de umbral
        const Umbral = calcularVectorUmbral(salidas);

        // Leer las variables globales
        const { rataAprendizaje, numIteraciones, errorMaximo } = leerDatosComoVariablesGlobales();

        return {
            Patrones: Patrones,
            entradas: entradas,
            salidas: salidas,
            datos: datos,
            matriz: matrizEntradasSalidas,
            Umbral: Umbral,
            rataAprendizaje: rataAprendizaje,
            numIteraciones: numIteraciones,
            errorMaximo: errorMaximo
        };
    } catch (error) {
        console.error('Error al obtener los datos para la inteligencia artificial:', error);
        return null;
    }
}



function calcularSalidaRed(datosParaIA, patron) {
    try {
        if (!datosParaIA) {
            throw new Error('Los datos para la inteligencia artificial no están disponibles');
        }
        
        const matriz = datosParaIA.matriz;
        const umbrales = datosParaIA.Umbral;
        const numSalidas = umbrales.length; // Número de salidas

        console.log(umbrales);
        console.log(patron);
        console.log(matriz);
        
        // Calcular la salida de la red para el patrón dado
        const salidaRed = [];
        for (let i = 0; i < numSalidas; i++) { // Iterar sobre el número de salidas
            let suma = 0;
            for (let j = 0; j < datosParaIA.entradas; j++) { // Iterar sobre el número de entradas
                suma += patron[j] * matriz[j][i]; // Multiplicar cada entrada del patrón con la entrada correspondiente de cada vector en la matriz
            }
            console.log("Salida de la red antes de funcion activacion: ",suma - (umbrales[i]))
            const salidaNeurona = funcionActivacion(suma - (umbrales[i])); // Aplicar función de activación
            salidaRed.push(salidaNeurona);
            console.log(`Salida de la neurona ${i + 1}:`, salidaNeurona); // Imprimir la salida de la neurona en la consola
        }


        return salidaRed;
    } catch (error) {
        console.error('Error al calcular la salida de la red:', error);
        return null;
    }
}

// Función de activación
function funcionActivacion(x) {
    return x >= 0 ? 1 : 0; // Si x es mayor o igual a 0, retorna 1; de lo contrario, retorna 0
}

function calcularErrorLineal(salidasDeseadas, salidaObtenida) {
    return salidasDeseadas - salidaObtenida;
}

// Función para calcular el error en el patrón
function calcularErrorPatron(erroresLineales) {
    const numSalidas = erroresLineales.length;
    const sumaErrores = erroresLineales.reduce((acc, error) => acc + error, 0);
    return sumaErrores / numSalidas;
}

// Función para guardar el error lineal en un archivo de texto
function guardarErrorLineal(erroresLineales) {
    const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'error_lineal.txt');
    const erroresLinealesString = erroresLineales.join(', ');
    fs.writeFileSync(rutaArchivo, erroresLinealesString);

    // Imprimir cada error lineal en la consola
    erroresLineales.forEach((error, index) => {
        console.log(`Error lineal ${index + 1}: ${error}`);
    });
}

// Función para guardar el error en el patrón en un archivo de texto
function calcularErrorPatron(erroresLineales, numSalidas) {
    const sumaErrores = erroresLineales.reduce((acc, error) => acc + error, 0);
    const errorPromedio = sumaErrores / (numSalidas * erroresLineales.length);
    return errorPromedio;
}

// Función para guardar el error en el patrón en un archivo de texto
function guardarErrorPatron(errorPatron) {
    const rutaArchivo = path.join(__dirname, '..', '..', 'MEDIA', 'error_patron.txt');

    // Utilizar el modo de apertura 'a' (append) para agregar al archivo sin sobrescribir
    fs.writeFileSync(rutaArchivo, errorPatron.toString() + '\n', { flag: 'a' });

    console.log('Error en el patrón guardado correctamente en el archivo:', rutaArchivo);
}

function ejecutarInteligenciaArtificial(datosParaIA) {
    try {
        if (!datosParaIA) {
            throw new Error('Los datos para la inteligencia artificial no están disponibles');
        }

        const numPatrones = datosParaIA.datos.length;
        const rataAprendizaje = datosParaIA.rataAprendizaje;
        const matriz = datosParaIA.matriz;
        const vectorUmbral = datosParaIA.Umbral;
        const numIteraciones = datosParaIA.numIteraciones;
        const errorMaximo=datosParaIA.errorMaximo

        for (let iteracion = 0; iteracion < numIteraciones; iteracion++) {
            console.log(`----- ITERACION NUMERO ${iteracion + 1} --------------------------------------------------------`);
            
            let errorTotalIteracion = 0;

            // Iterar sobre cada patrón de datos
            for (let i = 0; i < numPatrones; i++) {
                console.log(`NUEVO PATRON ENTRANDO ${i + 1}`);
                const patron = Object.values(datosParaIA.datos[i]); // Obtener los valores del patrón
                const salidaRed = calcularSalidaRed(datosParaIA, patron); // Calcular la salida de la red
                const salidasDeseadas = [];
                for (const key in datosParaIA.datos[i]) {
                    if (key.startsWith('m')) {
                        salidasDeseadas.push(datosParaIA.datos[i][key]);
                    }
                }                const erroresLineales = salidasDeseadas.map((deseada, index) => calcularErrorLineal(deseada, salidaRed[index])); // Calcular errores lineales
                const errorPatron = calcularErrorPatron(erroresLineales, datosParaIA.salidas); // Calcular error en el patrón

                errorTotalIteracion += errorPatron; // Sumar el error del patrón al error total de la iteración

                // Actualizar los pesos en la matriz
                for (let j = 0; j < datosParaIA.entradas; j++) {
                    for (let k = 0; k < datosParaIA.salidas; k++) {
                        const nuevoPeso = matriz[j][k] + (rataAprendizaje * erroresLineales[k] * patron[j]);
                        matriz[j][k] = parseFloat(nuevoPeso.toFixed(3)); // Convertir a número y luego limitar a 3 decimales
                    }
                }

                // Actualizar los umbrales
                for (let k = 0; k < datosParaIA.salidas; k++) {
                    const nuevoUmbral = vectorUmbral[k] + (rataAprendizaje * erroresLineales[k]*1);
                    vectorUmbral[k] = parseFloat(nuevoUmbral.toFixed(3)); // Convertir a número y luego limitar a 3 decimales
                }

                // Convertir la matriz actualizada a una cadena de texto
                const matrizString = matriz.map(row => row.join(',')).join('\n');

                // Sobrescribir la matriz en el archivo de texto
                const rutaArchivoMatriz = path.join(__dirname, '..', '..', 'MEDIA', 'matriz.txt');
                fs.writeFileSync(rutaArchivoMatriz, matrizString);

                // Convertir los umbrales actualizados a una cadena de texto
                const umbralesString = vectorUmbral.join(',');

                // Sobrescribir los umbrales en el archivo de texto
                const rutaArchivoUmbrales = path.join(__dirname, '..', '..', 'MEDIA', 'umbrales.txt');
                fs.writeFileSync(rutaArchivoUmbrales, umbralesString);

                // Guardar los errores lineales en un archivo de texto
                guardarErrorLineal(erroresLineales);
            }

            // Calcular el error de iteración
            const errorIteracion = Math.abs(errorTotalIteracion / numPatrones);

            // Escribir el error de iteración en un archivo de texto
            const rutaArchivoErrorIteracion = path.join(__dirname, '..', '..', 'MEDIA', 'error_iteracion.txt');
            fs.writeFileSync(rutaArchivoErrorIteracion, errorIteracion.toString() + '\n', { flag: 'a' });

            // Imprimir el error de iteración en la consola
            console.log('Error de iteración en esta iteración:', errorIteracion);

            // Verificar si el error de iteración es menor o igual que el error máximo
            if (errorIteracion <= errorMaximo) {
                console.log(`El error de iteración (${errorIteracion}) es menor o igual que el error máximo (${errorMaximo}). Deteniendo el entrenamiento en la iteracion #: ${iteracion+1}`);
                break; // Salir del bucle for
            }

            // Limpiar el archivo de errores de patrón para la siguiente iteración
            const rutaArchivoErrorPatron = path.join(__dirname, '..', '..', 'MEDIA', 'error_patron.txt');
            fs.writeFileSync(rutaArchivoErrorPatron, '');

            console.log('Errores de patrón limpiados para la siguiente iteración.');

            // Limpiar el archivo de errores lineales para la siguiente iteración
            const rutaArchivoErrorLineal = path.join(__dirname, '..', '..', 'MEDIA', 'error_lineal.txt');
            fs.writeFileSync(rutaArchivoErrorLineal, '');

            console.log('Errores lineales limpiados para la siguiente iteración.');
        }
    } catch (error) {
        console.error('Error al ejecutar la inteligencia artificial:', error);
    }
}




function ComenzarSimulacion() {
    try {
        // Ruta de la carpeta "Simulacion"
// Ruta de la carpeta "Simulacion"
    const rutaCarpetaSimulacion = path.join(__dirname, '..', '..', 'Simulacion');

        // Obtener la lista de archivos en la carpeta "Simulacion"
        const archivos = fs.readdirSync(rutaCarpetaSimulacion);

        // Filtrar los archivos para encontrar el único archivo Excel
        const archivoExcel = archivos.find(archivo => archivo.endsWith('.xlsx'));

        // Verificar si se encontró un archivo Excel
        if (!archivoExcel) {
            console.error('No se encontró ningún archivo Excel en la carpeta "Simulacion"');
            return;
        }

        // Ruta completa del archivo Excel
        const rutaArchivoExcel = path.join(rutaCarpetaSimulacion, archivoExcel);

        // Leer el archivo Excel
        const workbook = xlsx.readFile(rutaArchivoExcel);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir los datos del Excel a formato JSON
        const datos = xlsx.utils.sheet_to_json(worksheet);

        // Convertir los datos JSON a formato de texto
        const contenidoArchivoTxt = JSON.stringify(datos);

        // Ruta del archivo de texto de salida
        const rutaArchivoTxt = path.join(__dirname, '..','..','Simulacion', 'archivo.txt');

        // Guardar los datos en un archivo de texto
        fs.writeFileSync(rutaArchivoTxt, contenidoArchivoTxt);

        console.log('Se ha creado el archivo de texto correctamente.');
    } catch (error) {
        console.error('Error al convertir el archivo Excel a texto:', error);
    }
}


function leerArchivo(rutaArchivo) {
    try {
        const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
        return contenido;
    } catch (error) {
        console.error(`Error al leer el archivo ${rutaArchivo}:`, error);
        return null;
    }
}

function Simulacion() {
    try {
        // Rutas de los archivos
        const rutaMatriz = path.join(__dirname, '..','..', 'media', 'matriz.txt');
        const rutaUmbrales = path.join(__dirname, '..','..', 'media', 'umbrales.txt');
        const rutaArchivoSimulacion = path.join(__dirname, '..','..', 'simulacion', 'archivo.txt');

        // Leer los contenidos de los archivos
        const matrices = leerArchivo(rutaMatriz);
        const umbrales = leerArchivo(rutaUmbrales);
        const patron = leerArchivo(rutaArchivoSimulacion);
        

        const valoresPatron = JSON.parse(patron).map(item => Object.values(item)).flat().map(valor => parseFloat(valor));

          // Parsear los umbrales
          const arrUmbrales = umbrales.split(',').map(valor => parseFloat(valor.trim()));

            // Parsear la matriz
            const matrizFilas = matrices.trim().split('\n');
            const matriz = matrizFilas.map(fila => fila.split(',').map(valor => parseFloat(valor)));


        console.log("Matriz:\n", matriz);
        console.log( "\n");
        console.log("Umbrales:\n", arrUmbrales);
        console.log( "\n");
        console.log("patron" ,valoresPatron);

        // Calcular la salida de la red para el patrón dado
        const salidaRed = [];
        for (let i = 0; i < arrUmbrales.length; i++) { // Iterar sobre el número de salidas
            let suma = 0;
            for (let j = 0; j < valoresPatron.length; j++) { // Iterar sobre el número de entradas
                suma += valoresPatron[j] * matriz[j][i]; // Multiplicar cada entrada del patrón con la entrada correspondiente de cada vector en la matriz
            }
            const salidaNeurona = funcionActivacion(suma - arrUmbrales[i]); // Aplicar función de activación
            salidaRed.push(salidaNeurona);
            console.log(`Salida de la neurona ${i + 1}:`, salidaNeurona); // Imprimir la salida de la neurona en la consola
        }

        return salidaRed;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}

  module.exports = {
    crearMatrizEntradasSalidas,
    calcularVectorUmbral,
    leerDatosComoVariablesGlobales,
    obtenerDatosParaIA,
    ejecutarInteligenciaArtificial,
    ComenzarSimulacion,
    Simulacion
};