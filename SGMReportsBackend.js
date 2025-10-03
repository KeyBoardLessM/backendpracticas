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

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/volusat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log(" Conectado a MongoDB =)");
});

mongoose.connection.on("error", (err) => {
  console.error(" Error de conexión =(: ", err);
});

const uploadPath = path.join(__dirname, "Uploads/Documentation");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const uniqueName = `${
      path.parse(file.originalname).name
    }-${day}-${month}-${year}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

app.post("/SGM/Uploads/Documentation", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No se recibió ningún archivo válido. Solo PDFs." });
  }

  const schema = Joi.object({
    docName: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: error.details[0].message });
  }

  res.status(200).json({
    message: "Archivo PDF cargado correctamente",
    file: req.file.filename,
    path: req.file.path,
    docName: req.body.docName,
  });
});

app.get("/SGM/Uploads/Documentation", (req, res) => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      console.error("Error leyendo la carpeta:", err);
      return res
        .status(500)
        .json({ error: "No se pudieron listar los archivos" });
    }

    // Filtrar solo archivos PDF
    const pdfFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".pdf")
    );

    res.status(200).json({
      message: "Listado de archivos PDF",
      count: pdfFiles.length,
      files: pdfFiles,
    });
  });
});

app.use(
  "/SGM/Uploads/Documentation",
  express.static(path.join(__dirname, "Uploads/Documentation"))
);

app.post("/SGM/Meters", async (req, res) => {
  try {
    const nuevoMedidor = new Medidor(req.body);
    const saved = await nuevoMedidor.save();

    res.status(201).json({
      message: " Medidor registrado con éxito",
      data: saved,
    });
  } catch (err) {
    console.error(" Error guardando medidor:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET - listar todos los medidores
app.get("/SGM/Meters", async (req, res) => {
  try {
    const medidores = await Medidor.find();
    res.json(medidores);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los medidores" });
  }
});

app.post(
  "/SGM/Uploads/Reports-Evidence",
  upload.array("image", 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "No se recibieron archivos válidos. Solo imágenes." });
    }

    const schema = Joi.object({
      docName: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      // eliminar todas las imágenes subidas
      req.files.forEach((file) => fs.unlinkSync(file.path));
      return res.status(400).json({ error: error.details[0].message });
    }

    res.status(200).json({
      message: "Imágenes cargadas correctamente",
      count: req.files.length,
      files: req.files.map((f) => ({
        filename: f.filename,
        path: f.path,
      })),
      docName: req.body.docName,
    });
  }
);
app.listen(port, () => {
  console.log(`Backend de Volusat-auditoria corriendo en: ${port}`);
});

app.use((req, res) => {
  res.status(404).json({
    error: "Error 404: esta ruta o página no está definida en el sistema",
  });
});
