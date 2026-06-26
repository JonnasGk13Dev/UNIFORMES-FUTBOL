const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database("./uniformes.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS uniformes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apodo TEXT NOT NULL,
      numero INTEGER NOT NULL UNIQUE,
      talla TEXT NOT NULL,
      manga TEXT NOT NULL,
      negro TEXT NOT NULL,
      observaciones TEXT,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/api/uniformes", (req, res) => {
  db.all("SELECT * FROM uniformes ORDER BY numero ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al obtener registros" });
    }

    res.json(rows);
  });
});

app.post("/api/uniformes", (req, res) => {
  const { nombre, apodo, numero, talla, manga, negro, observaciones } = req.body;

  if (!nombre || !apodo || !talla || !manga || !negro || !Number.isInteger(Number(numero))) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben llenarse correctamente"
    });
  }

  if (numero < 1 || numero > 99) {
    return res.status(400).json({
      mensaje: "El número debe estar entre 1 y 99"
    });
  }

  db.get("SELECT COUNT(*) AS total FROM uniformes", [], (err, row) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al validar registros" });
    }

    if (row.total >= 15) {
      return res.status(400).json({ mensaje: "Ya se registraron los 15 uniformes" });
    }

    db.run(
      `
      INSERT INTO uniformes 
      (nombre, apodo, numero, talla, manga, negro, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [nombre, apodo, Number(numero), talla, manga, negro, observaciones],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ mensaje: "Ese número ya está ocupado" });
          }

          return res.status(500).json({ mensaje: "Error al registrar uniforme" });
        }

        res.status(201).json({
          mensaje: "Uniforme registrado correctamente",
          id: this.lastID
        });
      }
    );
  });
});

app.delete("/api/uniformes/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM uniformes WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ mensaje: "Error al eliminar registro" });
    }

    res.json({ mensaje: "Registro eliminado correctamente" });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});