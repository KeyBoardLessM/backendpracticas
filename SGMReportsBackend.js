const express = require("express");
const app = express();
const port = 3002;
const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");

const Medidor = require("./models/medidor");
const Report = require("./models/reporte");

app.use(express.json());
app.use(cors());

// 🔗 Conexión con MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/volusat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("=) Conectado a MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("=() Error de conexión:", err);
});

// 📁 Directorios de carga
const uploadDocsPath = path.join(__dirname, "Uploads/Documentation");
const uploadReportsPath = path.join(__dirname, "Uploads/Reports");

[uploadDocsPath, uploadReportsPath].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🧾 Configuración de multer para PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDocsPath),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"));
  },
});

// 🖼 Configuración de multer para imágenes de reportes
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadReportsPath),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});
const uploadImages = multer({ storage: imageStorage });

// 🧩 ENDPOINTS -------------------------------

// Subir documentación PDF
app.post("/SGM/Uploads/Documentation", uploadPDF.single("file"), (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ error: "No se recibió ningún archivo válido." });

  res.status(200).json({
    message: "Archivo PDF cargado correctamente",
    file: req.file.filename,
    path: req.file.path,
  });
});

app.get("/SGM/Uploads/Documentation", (req, res) => {
  fs.readdir(uploadDocsPath, (err, files) => {
    if (err)
      return res.status(500).json({ error: "Error al listar los archivos" });
    const pdfs = files.filter((f) => f.endsWith(".pdf"));
    res.json({
      message: "Listado de archivos PDF",
      count: pdfs.length,
      files: pdfs,
    });
  });
});

// Registrar un nuevo medidor
app.post("/SGM/Meters", async (req, res) => {
  try {
    const nuevo = new Medidor(req.body);
    const saved = await nuevo.save();
    res.status(201).json({ message: "Medidor guardado", data: saved });
  } catch (err) {
    console.error("Error guardando medidor:", err);
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos los medidores
app.get("/SGM/Meters", async (req, res) => {
  try {
    const medidores = await Medidor.find();
    res.json(medidores);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los medidores" });
  }
});

// Guardar reporte + actualizar estado de medidor
app.post(
  "/SGM/Reports",
  uploadImages.array("imagenes", 10),
  async (req, res) => {
    try {
      const {
        numeroSerie,
        tipoReporte,
        descripcion,
        tecnicoResponsable,
        observaciones,
        fechaReporte,
      } = req.body;

      const nuevoReporte = new Report({
        numeroSerie,
        tipoReporte,
        descripcion,
        tecnicoResponsable,
        observaciones,
        fechaReporte,
        imagenes: req.files.map((f) => f.filename),
      });

      await nuevoReporte.save();

      // Determinar nuevo estado del medidor
      let nuevoEstado = "pendiente";
      if (["ajuste", "reparacion"].includes(tipoReporte))
        nuevoEstado = "calibrado";
      if (["fallo", "falta"].includes(tipoReporte)) nuevoEstado = "fallo";

      await Medidor.findOneAndUpdate(
        { numeroSerie },
        { estadoCalibracion: nuevoEstado }
      );

      res.status(200).json({
        message: "Reporte guardado y medidor actualizado",
        reporte: nuevoReporte,
      });
    } catch (err) {
      console.error("Error guardando reporte:", err);
      res.status(500).json({ error: "Error al guardar el reporte" });
    }
  }
);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en puerto ${port}`);
});
