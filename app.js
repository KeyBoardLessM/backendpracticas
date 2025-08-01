const express = require("express");
const app = express();
const port = 3002;

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
  console.log("req.query", req.query);
  const { Name, LastNames } = req.query;
  validateData(req.query, res);
  // saveInDB(req.query);

  res.send(
    "olita de mar " +
      Name +
      " " +
      LastNames +
      ", esta es mi segunda consulta de expressjs de users"
  );
});

app.post("/users", (req, res) => {
  res.send("petició nde post recibida para users");
});
app.put("/users", (req, res) => {
  res.send("petición de put recibida para users");
});
app.delete("/users", (req, res) => {
  res.send("petición de delete recibida para users");
});

app.use((req, res) => {
  validateData(req.query, res);
  res
    .status(404)
    .send(
      "  Error 404: esta ruta o pagina no tenemos planeado implementarla de manera alguna"
    );
});

app.listen(port, () => {
  console.log(`aplicación de ejemplo escuchando or el puerto: ${port}`);
});
