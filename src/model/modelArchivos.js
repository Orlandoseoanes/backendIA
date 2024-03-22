// Importar el módulo Sequelize y configuración de conexión a la base de datos
const { Sequelize, DataTypes } = require('sequelize');

const sequelize=require("../app/conexion");

// Definir el modelo de la tabla archivos
const Archivo = sequelize.define('Archivo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false, // No necesitamos timestamps de createdAt y updatedAt en este ejemplo
  tableName: 'archivos' // Nombre de la tabla en la base de datos
});

// Sincronizar el modelo con la base de datos (crear la tabla si no existe)



module.exports=Archivo;
