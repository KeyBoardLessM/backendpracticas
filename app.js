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
  res.json({
    message: `hola, ${Name} ${LastNames}!`,
  });

  res.send(
    "olita de mar" +
      name +
      lastnames +
      ", esta es mi segunda consulta de expressjs"
  );
});

app.listen(port, () => {
  console.log(`aplicación de ejemplo escuchando or el puerto: ${port}`);
});
