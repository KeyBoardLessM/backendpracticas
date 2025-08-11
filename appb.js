const { error } = require("console");
const express = require("express");
const app = express();
const port = 3002;
const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const multer = require("multer");
app.use(express.json());

const filePath = path.join(
  "D:",
  "DISCOD",
  "A-practicas",
  "SystemData",
  "Registers.json"
);
const imagepath = path.join(
  "D:",
  "DISCOD",
  "A-practicas",
  "SystemData",
  "uploads"
);

const validCareers = [
  "Ingeniería en Sistemas",
  "Ingeniería Mecatrónica",
  "Ingeniería Industrial",
  "Ciencias Computacionales",
  "Licenciatura en Informática",
];

const validLanguages = [
  "JavaScript",
  "Python",
  "C++",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
];

const RegisterSchema = Joi.object({
  Name: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({ "string.empty": "El nombre no puede estar vacío" }),

  LastNames: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({ "string.empty": "El apellido no puede estar vacío" }),

  School: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({ "string.empty": "El instituto no puede estar vacío" }),

  Mail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({ "string.email": "El correo no tiene formato válido" }),

  birthDate: Joi.date()
    .min("1908-01-01")
    .max("2008-01-01")
    .required()
    .messages({
      "date.less": "debes tener minimo 17 años para registrarte",
      "date.base": "Fecha de nacimiento inválida",
    }),

  Phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "El teléfono debe tener exactamente 10 dígitos ",
    }),

  career: Joi.string()
    .valid(...validCareers)
    .required()
    .messages({
      "any.only": `La carrera debe ser una de las siguientes: ${validCareers.join(
        ", "
      )}`,
    }),

  ProgrammingLanguajes: Joi.object()
    .custom((value, helpers) => {
      const keys = Object.keys(value);
      for (let key of keys) {
        if (!validLanguages.includes(key)) {
          return helpers.error("object.unknown", { key });
        }
        if (typeof value[key] !== "boolean") {
          return helpers.error("object.base", { key });
        }
      }
      return value;
    }, "Validación de lenguajes de programación")
    .required()
    .messages({
      "object.base": "valor fuera derango",
      "object.unknown": "Lenguaje no permitido",
    }),
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagepath); // ← Asegúrate de que exista esta carpeta
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isMimeType = allowedTypes.test(file.mimetype);
  const isExtName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isMimeType && isExtName) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png)"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
});

app.get("/api/residentes", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("no se leyó bien el archivo", err);
      return res
        .status(500)
        .json({ error: "no jalo la lectura del archivo del servidor" });
    } else {
      try {
        const MemoryUsers = JSON.parse(filedata);

        res.json(MemoryUsers);
      } catch (parseErr) {
        console.error(
          "no funcionó la conversión del archivojson de usuarios",
          parseErr
        );
        res
          .status(500)
          .json({ error: "no jalo el procesamiento de los datos de users" });
      }
    }
  });
});

app.get("/api/residentes/:uId", (req, res) => {
  const uId = parseInt(req.params.uId);
  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("no se leyó bien el archivo", err);
      return res
        .status(500)
        .json({ error: "no jalo la lectura del archivo del servidor" });
    } else {
      try {
        const MemoryUsers = JSON.parse(filedata);

        const OneUser = MemoryUsers.find((u) => u.id === uId);

        if (OneUser) {
          res.json(OneUser);
        } else {
          res.json("usuario " + uId + " inexistente");
        }
      } catch (parseErr) {
        console.error(
          "no funcionó la conversión del archivojson de usuarios",
          parseErr
        );
        res
          .status(500)
          .json({ error: "no jalo el procesamiento de los datos de users" });
      }
    }
  });
});

app.post(
  "/api/residentes",
  /*upload.single("image"),*/ (req, res) => {
    const newUser = req.body;

    const { error, value } = RegisterSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        errores: error.details.map((detail) => detail.message),
      });
    }

    newUser.id = Date.now() + Math.floor(Math.random() * 1000);
    //newUser.image = path.join(imagepath, req.file.filename);

    fs.readFile(filePath, "utf-8", (err, filedata) => {
      if (err) {
        console.error("no se leyó bien el archivo", err);
        return res
          .status(500)
          .json({ error: "no jalo la lectura del archivo del servidor" });
      } else {
        try {
          const MemoryUsers = JSON.parse(filedata);

          const OneUser = MemoryUsers.find((u) => u.id === newUser.id);

          if (OneUser) {
            res.json(`ese usuario que deseas añadir ya existe :  ${OneUser}`);
          } else {
            MemoryUsers.push(newUser);

            fs.writeFile(
              filePath,
              JSON.stringify(MemoryUsers, null, 2),
              (err) => {
                if (err) {
                  console.error(
                    "fallo durante la escritura de users-json",
                    err
                  );
                  return res.status(500).json({
                    error: "Error al guardar un nuevo usuario en json users",
                  });
                } else {
                  res.status(201).json({
                    message: "Usuario guardado exitosamente",
                    user: newUser,
                  });
                }
              }
            );
          }
        } catch (parseErr) {
          console.error(
            "no funcionó la conversión del archivojson de usuarios",
            parseErr
          );
          res
            .status(500)
            .json({ error: "no jalo el procesamiento de los datos de users" });
        }
      }
    });
  }
);

app.put("/api/residentes/:uId", (req, res) => {
  const newUser = req.body;
  const uId = parseInt(req.params.uId);

  const { error, value } = RegisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      errores: error.details.map((detail) => detail.message),
    });
  }

  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("no se leyó bien el archivo", err);
      return res
        .status(500)
        .json({ error: "no jalo la lectura del archivo del servidor" });
    } else {
      try {
        const MemoryUsers = JSON.parse(filedata);

        const OneUser = MemoryUsers.find((u) => u.id === uId);
        const deluserindex = MemoryUsers.findIndex((u) => u.id === uId);
        if (OneUser) {
          newUser.id = uId;
          MemoryUsers.splice(deluserindex, 1);
          MemoryUsers.push(newUser);

          fs.writeFile(
            filePath,
            JSON.stringify(MemoryUsers, null, 2),
            (err) => {
              if (err) {
                console.error("fallo durante la escritura de users-json", err);
                return res.status(500).json({
                  error: "Error al cambiar el usuario en json users",
                });
              } else {
                res.status(201).json({
                  message: "Usuario cambiado exitosamente",
                });
              }
            }
          );
        } else {
          res.json("usuario " + uId + " inexistente");
        }
      } catch (parseErr) {
        console.error(
          "no funcionó la conversión del archivojson de usuarios",
          parseErr
        );
        res
          .status(500)
          .json({ error: "no jalo el procesamiento de los datos de users" });
      }
    }
  });
});

app.delete("/api/residentes/:uId", (req, res) => {
  const uId = parseInt(req.params.uId);
  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("no se leyó bien el archivo", err);
      return res
        .status(500)
        .json({ error: "no jalo la lectura del archivo del servidor" });
    } else {
      try {
        const MemoryUsers = JSON.parse(filedata);

        const OneUser = MemoryUsers.find((u) => u.id === uId);
        const deluserindex = MemoryUsers.findIndex((u) => u.id === uId);

        if (OneUser) {
          MemoryUsers.splice(deluserindex, 1);

          fs.writeFile(
            filePath,
            JSON.stringify(MemoryUsers, null, 2),
            (err) => {
              if (err) {
                console.error("fallo durante la escritura de users-json", err);
                return res.status(500).json({
                  error: "Error al borrar el usuario en json users",
                });
              } else {
                res.status(201).json({
                  message: "Usuario borrado exitosamente",
                });
              }
            }
          );
        } else {
          res.json("usuario " + uId + " inexistente");
        }
      } catch (parseErr) {
        console.error(
          "no funcionó la conversión del archivojson de usuarios",
          parseErr
        );
        res
          .status(500)
          .json({ error: "no jalo el procesamiento de los datos de users" });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`aplicación de ejemplo escuchando or el puerto: ${port}`);
});

app.use((req, res) => {
  res
    .status(404)
    .send(
      "  Error 404: esta ruta o pagina no tenemos planeado implementarla de manera alguna"
    );
});
