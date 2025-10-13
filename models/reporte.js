const mongoose = require("mongoose");

const reporteSchema = new mongoose.Schema({
  numeroSerie: {
    type: String,
    required: true,
  },
  tipoReporte: {
    type: String,
    enum: ["ajuste", "reparacion", "fallo", "falta"],
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  tecnicoResponsable: {
    type: String,
    required: true,
  },
  observaciones: {
    type: String,
  },
  fechaReporte: {
    type: Date,
    default: Date.now,
  },
  imagenes: {
    type: [String], // nombres de archivos de imágenes guardadas
    default: [],
  },
});

module.exports = mongoose.model("Report", reporteSchema);
