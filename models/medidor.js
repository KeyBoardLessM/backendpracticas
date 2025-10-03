const mongoose = require("mongoose");

const MedidorSchema = new mongoose.Schema({
  modelo: { type: String, required: true },
  tipoHidrocarburo: { type: String, required: true },
  estadoInstalacion: {
    type: String,
    enum: ["instalado", "no-instalado"],
    required: true,
  },
  numeroSerie: { type: String, required: true, unique: true },
  ubicacion: { type: String, required: true },
  tipoMedidor: { type: String, enum: ["estatico", "dinamico"], required: true },
  frecuenciaRevision: {
    type: String,
    enum: ["mensual", "trimestral", "semestral", "anual"],
    required: true,
  },
  estadoCalibracion: {
    type: String,
    enum: ["calibrado", "pendiente", "fallo"],
    required: true,
  },
  fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Medidor", MedidorSchema);
