const { error } = require("console");
const express = require("express");
const app = express();
const port = 3002;
const fs = require("fs");
app.use(express.json());

const validateData = (data, res) => {
  if (!data.Name) {
    return res.status(400).json({ error: "Missing name" });
  }
  if (!data.LastNames) {
    return res.status(400).json({ error: "Missing LastNames" });
  }
};

app.get("/", (req, res) => {
  console.log("req.query", req.query);
  const { Name, LastNames } = req.query;
  validateData(req.query, res);
  // saveInDB(req.query);

  res.send(
    "olita de mar " +
      Name +
      " " +
      LastNames +
      ", esta es mi segunda consulta de expressjs"
  );
});

app.post("/", (req, res) => {
  res.send("petició nde post recibida");
});
app.put("/", (req, res) => {
  res.send("petición de put recibida");
});
app.delete("/", (req, res) => {
  res.send("petición de delete recibida");
});

app.get("/users", (req, res) => {
  fs.readFile("users.json", "utf-8", (err, filedata) => {
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
app.get("/users/:uId", (req, res) => {
  const uId = parseInt(req.params.uId);
  fs.readFile("users.json", "utf-8", (err, filedata) => {
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
          res.send("usuario " + uId + " inexistente");
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

app.delete("/users/:uId", (req, res) => {
  const uId = parseInt(req.params.uId);
  fs.readFile("users.json", "utf-8", (err, filedata) => {
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
          MemoryUsers.pop(OneUser);

          fs.writeFile(
            "users.json",
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
          res.send("usuario " + uId + " inexistente");
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

app.put("/users/:uId", (req, res) => {
  const newUser = req.body;
  const uId = parseInt(req.params.uId);
  const RequiredUserFields = [
    "id",
    "password",
    "first_name",
    "last_name",
    "username",
    "email",
    "gender",
  ];

  const missedUserfield = RequiredUserFields.filter((field) => !newUser[field]);

  if (missedUserfield.length > 0) {
    return res.status(400).json({
      error: `falta de elementos en la introducción de datos: ${missedUserfield.join(
        ", "
      )}`,
    });
  }

  fs.readFile("users.json", "utf-8", (err, filedata) => {
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
          MemoryUsers.pop(OneUser);
          MemoryUsers.push(newUser);

          fs.writeFile(
            "users.json",
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
          res.send("usuario " + uId + " inexistente");
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

app.post("/users", (req, res) => {
  const newUser = req.body;
  const RequiredUserFields = [
    "id",
    "password",
    "first_name",
    "last_name",
    "username",
    "email",
    "gender",
  ];

  const missedUserfield = RequiredUserFields.filter((field) => !newUser[field]);

  if (missedUserfield.length > 0) {
    return res.status(400).json({
      error: `falta de elementos en la introducción de datos: ${missedUserfield.join(
        ", "
      )}`,
    });
  }
  fs.readFile("users.json", "utf-8", (err, filedata) => {
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
            "users.json",
            JSON.stringify(MemoryUsers, null, 2),
            (err) => {
              if (err) {
                console.error("fallo durante la escritura de users-json", err);
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
});
app.use((req, res) => {
  res
    .status(404)
    .send(
      "  Error 404: esta ruta o pagina no tenemos planeado implementarla de manera alguna"
    );
});
