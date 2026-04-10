// app.js - Versión completa
const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql2");

// Configuración
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Conexion base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "prueba",
  password: "prueba",
  database: "practica_proyecto_final",
});

conexion.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    return;
  }
  console.log("Conexión a la base de datos establecida correctamente");
});

// RUTAS (páginas)
app.get("/", (req, res) => {
  const sql = `
    SELECT *, 
    l.nombre as nombre_alumno, 
    a.nombre as nombre_docente 
    FROM grupos g 
    JOIN horarios h ON g.id_horario = h.id_horario 
    JOIN cursos c ON h.id_curso = c.id_curso 
    JOIN docentes a ON h.id_docente = a.matricula_docente 
    JOIN alumnos l ON g.id_alumno = l.id`;

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener datos para el resumen:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }
    res.render("index", {
      titulo: "Inicio",
      horarios: resultados,
    });
  });
});

app.get("/pagina1", (req, res) => {
  res.render("pagina1", { titulo: "Página 1" });
});

//Rutas para alumnos
//Ruta de la tabla alumnos
app.get("/alumnos", (req, res) => {
  conexion.query(
    "SELECT * FROM alumnos JOIN carreras ON alumnos.id_carrera = carreras.id_carrera",
    (error, results) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.render("alumnos", {
          titulo: "Alumnos",
          alumnos: [],
          error: "Error al obtener los datos de la base de datos",
        });
        return;
      }
      console.log("Datos obtenidos de la base de datos:", results);
      res.render("alumnos", {
        titulo: "Alumnos",
        alumnos: results,
        error: null,
      });
    },
  );
});
//Ruta muestra vista de agregar alumno
app.get("/agregar", (req, res) => {
  conexion.query("SELECT * FROM carreras", (error, carreras) => {
    res.render("functions/alumnos/agregar", {
      titulo: "Agregar Alumno",
      carreras: carreras,
    });
  });
});
//Ruta de la accion de guardar alumno en agregar alumno
app.post("/agregar", (req, res) => {
  const { nombre, email, edad, ciudad, carrera } = req.body;
  const query =
    "INSERT INTO alumnos (nombre, email, edad, ciudad, id_carrera) VALUES (?, ?, ?, ?, ?)";
  conexion.query(query, [nombre, email, edad, ciudad, carrera], (error) => {
    if (error) {
      console.error("Error al agregar alumno:", error);
      res.status(500).send("Error al agregar alumno");
      return;
    }
    res.redirect("/alumnos");
  });
});
//Ruta muestra vista de editar alumno
app.get("/editar/:id", (req, res) => {
  const { id } = req.params;
  const sqlCarreras = "SELECT * FROM carreras";
  conexion.query(sqlCarreras, (errorCarreras, carreras) => {
    if (errorCarreras) {
      console.error("Error al obtener carreras:", errorCarreras);
      res.status(500).send("Error en la base de datos");
      return;
    }
    const sql = "SELECT * FROM alumnos WHERE id = ?";
    conexion.query(sql, [id], (error, resultados) => {
      if (error) {
        console.error("Error al obtener alumno:", error);
        res.status(500).send("Error en la base de datos");
        return;
      }

      if (resultados.length === 0) {
        res.send("Alumno no encontrado");
        return;
      }

      res.render("functions/alumnos/editar", {
        titulo: "Editar Alumno",
        alumno: resultados[0],
        carreras: carreras,
      });
    });
  });
});
//Ruta de la accion de guardar alumno editado
app.post("/editar/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, email, edad, ciudad, carrera } = req.body;

  const sql = `
        UPDATE alumnos 
        SET nombre = ?, email = ?, edad = ?, ciudad = ?, id_carrera = ? 
        WHERE id = ?
    `;

  conexion.query(sql, [nombre, email, edad, ciudad, carrera, id], (error) => {
    if (error) {
      console.error("Error al actualizar alumno:", error);
      res.status(500).send("Error al actualizar alumno");
      return;
    }

    res.redirect("/alumnos");
  });
});
//Ruta de la accion de eliminar alumno
app.post("/eliminar/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM alumnos WHERE id = ?";
  conexion.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al eliminar alumno:", error);
      res.status(500).send("Error al eliminar alumno");
      return;
    }
    res.redirect("/alumnos");
  });
});

//Rutas para cursos
app.get("/cursos", (req, res) => {
  conexion.query("SELECT * FROM cursos", (error, results) => {
    if (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.render("cursos", {
        titulo: "Cursos",
        cursos: [],
        error: "Error al obtener los datos de la base de datos",
      });
      return;
    }
    console.log("Datos obtenidos de la base de datos:", results);
    res.render("cursos", {
      titulo: "Cursos",
      cursos: results,
      error: null,
    });
  });
});

app.get("/agregar_curso", (req, res) => {
  res.render("functions/cursos/agregar", { titulo: "Agregar Curso" });
});
app.post("/agregar_curso", (req, res) => {
  const { nombre, semestre } = req.body;
  const query = "INSERT INTO cursos (nombre_materia, semestre) VALUES (?, ?)";
  conexion.query(query, [nombre, semestre], (error) => {
    if (error) {
      console.error("Error al agregar curso:", error);
      res.status(500).send("Error al agregar curso");
      return;
    }
    res.redirect("/cursos");
  });
});

app.get("/editar_curso/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM cursos WHERE id_curso = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener curso:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }

    if (resultados.length === 0) {
      res.send("Curso no encontrado");
      return;
    }

    res.render("functions/cursos/editar", {
      titulo: "Editar Curso",
      curso: resultados[0],
    });
  });
});

app.post("/editar_curso/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, semestre } = req.body;

  const sql = `
        UPDATE cursos 
        SET nombre_materia = ?, semestre = ? 
        WHERE id_curso = ?
    `;

  conexion.query(sql, [nombre, semestre, id], (error) => {
    if (error) {
      console.error("Error al actualizar curso:", error);
      res.status(500).send("Error al actualizar curso");
      return;
    }

    res.redirect("/cursos");
  });
});

app.post("/eliminar_curso/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cursos WHERE id_curso = ?";
  conexion.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al eliminar curso:", error);
      res.status(500).send("Error al eliminar curso");
      return;
    }
    res.redirect("/cursos");
  });
});

//Rutas para docentes
app.get("/docentes", (req, res) => {
  conexion.query(
    "SELECT * FROM docentes JOIN carreras ON docentes.id_carrera = carreras.id_carrera",
    (error, results) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.render("docentes", {
          titulo: "Docentes",
          docentes: [],
          error: "Error al obtener los datos de la base de datos",
        });
        return;
      }
      console.log("Datos obtenidos de la base de datos:", results);
      res.render("docentes", {
        titulo: "Docentes",
        docentes: results,
        error: null,
      });
    },
  );
});

app.get("/agregar_docente", (req, res) => {
  conexion.query("SELECT * FROM carreras", (error, carreras) => {
    res.render("functions/docentes/agregar", {
      titulo: "Agregar Docente",
      carreras: carreras,
    });
  });
});

app.post("/agregar_docente", (req, res) => {
  const { nombre, carrera } = req.body;
  const query = "INSERT INTO docentes (nombre, id_carrera) VALUES (?, ?)";
  conexion.query(query, [nombre, carrera], (error) => {
    if (error) {
      console.error("Error al agregar docente:", error);
      res.status(500).send("Error al agregar docente");
      return;
    }
    res.redirect("/docentes");
  });
});

app.get("/editar_docente/:id", (req, res) => {
  const { id } = req.params;
  const sqlCarreras = "SELECT * FROM carreras";
  const sql = "SELECT * FROM docentes WHERE matricula_docente = ?";
  conexion.query(sqlCarreras, (errorCarreras, carreras) => {
    if (errorCarreras) {
      console.error("Error al obtener carreras:", errorCarreras);
      res.status(500).send("Error en la base de datos");
      return;
    }
    conexion.query(sql, [id], (error, resultados) => {
      if (error) {
        console.error("Error al obtener docente:", error);
        res.status(500).send("Error    en la base de datos");
        return;
      }

      if (resultados.length === 0) {
        res.send("Docente no encontrado");
        return;
      }

      res.render("functions/docentes/editar", {
        titulo: "Editar Docente",
        docente: resultados[0],
        carreras: carreras,
      });
    });
  });
});

app.post("/editar_docente/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, carrera } = req.body;

  const sql = `
        UPDATE docentes 
        SET nombre = ?, id_carrera = ?
        WHERE matricula_docente = ?
    `;

  conexion.query(sql, [nombre, carrera, id], (error) => {
    if (error) {
      console.error("Error al actualizar docente:", error);
      res.status(500).send("Error al actualizar docente");
      return;
    }

    res.redirect("/docentes");
  });
});

app.post("/eliminar_docente/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM docentes WHERE matricula_docente = ?";
  conexion.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al eliminar docente:", error);
      res.status(500).send("Error al eliminar docente");
      return;
    }
    res.redirect("/docentes");
  });
});

app.get("/horario_docente/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM docentes WHERE matricula_docente = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener docente:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }

    if (resultados.length === 0) {
      res.send("Docente no encontrado");
      return;
    }

    const sqlCursos = "SELECT * FROM cursos";
    conexion.query(sqlCursos, (errorCursos, cursos) => {
      if (errorCursos) {
        console.error("Error al obtener cursos:", errorCursos);
        res.status(500).send("Error en la base de datos");
        return;
      }

      res.render("functions/docentes/horario", {
        titulo: "Asignar Horario a Docente",
        docente: resultados[0],
        cursos: cursos,
      });
    });
  });
});

app.post("/horario_docente/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, horario_inicio, horario_fin } = req.body;

  const sql = `iNSERT INTO horarios (id_docente, id_curso, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)`;

  conexion.query(sql, [id, nombre, horario_inicio, horario_fin], (error) => {
    if (error) {
      console.error("Error al asignar horario:", error);
      res.status(500).send("Error al asignar horario");
      return;
    }

    res.redirect("/docentes");
  });
});

app.get("/horario_docente_view/:id", (req, res) => {
  const { id } = req.params;
  const sql =
    "SELECT * FROM horarios h JOIN cursos c ON h.id_curso = c.id_curso JOIN docentes d ON h.id_docente = d.matricula_docente WHERE h.id_docente = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener docente:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }

    if (resultados.length === 0) {
      res.send("Docente no encontrado");
      return;
    }

    res.render("functions/docentes/view", {
      titulo: "Ver Horario del Docente",
      docente: resultados[0],
      horarios: resultados,
    });
  });
});

app.get("/horario_alumno/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM alumnos WHERE id = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener alumno:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }

    if (resultados.length === 0) {
      res.send("Alumno no encontrado");
      return;
    }

    const sqlHorarios =
      "SELECT * FROM horarios h JOIN cursos c ON h.id_curso = c.id_curso JOIN docentes a ON h.id_docente = a.matricula_docente";
    conexion.query(sqlHorarios, (errorCursos, cursos) => {
      if (errorCursos) {
        console.error("Error al obtener cursos:", errorCursos);
        res.status(500).send("Error en la base de datos");
        return;
      }

      res.render("functions/alumnos/horario", {
        titulo: "Asignar Horario a Alumno",
        alumno: resultados[0],
        cursos: cursos,
      });
    });
  });
});

app.post("/horario_alumno/:id", (req, res) => {
  const { id } = req.params;
  const { horario } = req.body;

  const sql = `INSERT INTO grupos (id_horario, id_alumno) VALUES (?, ?)`;

  conexion.query(sql, [horario, id], (error) => {
    if (error) {
      console.error("Error al asignar materia:", error);
      res.status(500).send("Error al asignar materia");
      return;
    }

    res.redirect("/alumnos");
  });
});

app.get("/horario_alumno_view/:id", (req, res) => {
  const { id } = req.params;
  const sql =
    "SELECT *, l.nombre as nombre_alumno, a.nombre as nombre_docente FROM grupos g JOIN horarios h ON g.id_horario = h.id_horario JOIN cursos c ON h.id_curso = c.id_curso JOIN docentes a ON h.id_docente = a.matricula_docente join alumnos l on g.id_alumno = l.id WHERE g.id_alumno = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener horario del alumno:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }

    if (resultados.length === 0) {
      res.send("Alumno no encontrado");
      return;
    }

    res.render("functions/alumnos/view", {
      titulo: "Ver Horario del Alumno",
      alumno: resultados[0],
      horarios: resultados,
    });
  });
});

app.get("/prueba", (req, res) => {
  const alumnos_materias = `
    SELECT * FROM alumnos JOIN grupos ON alumnos.id = grupos.id_alumno JOIN horarios ON 
    grupos.id_horario = horarios.id_horario JOIN cursos ON horarios.id_curso = cursos.id_curso`;

  const horarios_materias = `
    SELECT * FROM horarios JOIN cursos ON horarios.id_curso = cursos.id_curso `;

  // Mostrar los grupos con el docente asignado.
  const grupos_docentes = `
    SELECT * FROM grupos JOIN horarios ON grupos.id_horario = horarios.id_horario JOIN 
    docentes ON horarios.id_docente = docentes.matricula_docente`;

  // Mostrar todos los alumnos, tengan o no grupo.
  const alumnos_grupos = `
    SELECT * FROM alumnos LEFT JOIN grupos ON alumnos.id = grupos.id_alumno`;

  conexion.query(alumnos_materias, (error, consulta) => {
    if (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.status(500).send("Error en la base de datos");
      return;
    }
    conexion.query(horarios_materias, (error, consulta_dos) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).send("Error en la base de datos");
        return;
      }
      conexion.query(grupos_docentes, (error, consulta_tres) => {
        if (error) {
          console.error("Error al ejecutar la consulta:", error);
          res.status(500).send("Error en la base de datos");
          return;
        }
        conexion.query(alumnos_grupos, (error, consulta_cuatro) => {
          if (error) {
            console.error("Error al ejecutar la consulta:", error);
            res.status(500).send("Error en la base de datos");
            return;
          }

          console.log("Datos obtenidos de la base de datos:", consulta_cuatro);
          res.render("prueba", {
            titulo: "Prueba",
            cargas: consulta,
            detalles: consulta_dos,
            especificaciones: consulta_tres,
            alumnos_grupos: consulta_cuatro,
          });
        });
      });
    });
  });
});

app.get("/carreras", (req, res) => {
  conexion.query("SELECT * FROM carreras", (error, results) => {
    if (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.render("carreras", {
        titulo: "Carreras",
        carreras: [],
        error: "Error al obtener los datos de la base de datos",
      });
      return;
    }
    console.log("Datos obtenidos de la base de datos:", results);
    res.render("carreras", {
      titulo: "Carreras",
      carreras: results,
      error: null,
    });
  });
});

app.get("/agregar/carrera", (req, res) => {
  res.render("functions/carreras/create", { titulo: "Agregar Carrera" });
});

app.post("/agregar/carrera", (req, res) => {
  const { nombre_carrera } = req.body;
  const query = "INSERT INTO carreras (nombre_carrera) VALUES (?)";
  conexion.query(query, [nombre_carrera], (error) => {
    if (error) {
      console.error("Error al agregar carrera:", error);
      res.status(500).send("Error al agregar carrera");
      return;
    }
    res.redirect("/carreras");
  });
});

app.get("/editar/carrera/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM carreras WHERE id_carrera = ?";
  conexion.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener la carrera:", error);
      res.status(500).send("Error al obtener la carrera");
      return;
    }
    if (resultados.length === 0) {
      res.send("Carrera no encontrada");
      return;
    }
    res.render("functions/carreras/editar", {
      titulo: "Editar Carrera",
      carrera: resultados[0],
    });
  });
});

app.post("/editar/carrera/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_carrera } = req.body;
  const query = "UPDATE carreras SET nombre_carrera = ? WHERE id_carrera = ?";
  conexion.query(query, [nombre_carrera, id], (error) => {
    if (error) {
      console.error("Error al actualizar la carrera:", error);
      res.status(500).send("Error al actualizar la carrera");
      return;
    }
    res.redirect("/carreras");
  });
});

app.post("/eliminar/carrera/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM carreras WHERE id_carrera = ?";
  conexion.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al eliminar la carrera:", error);
      res.status(500).send("Error al eliminar la carrera");
      return;
    }
    res.redirect("/carreras");
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor listo! Abre http://localhost:${port}`);
});
