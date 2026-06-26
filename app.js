const form = document.getElementById("formUniforme");
const tabla = document.getElementById("tablaRegistros");
const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");

const API_URL = "/api/uniformes";

async function cargarRegistros() {
  try {
    const respuesta = await fetch(API_URL);
    const registros = await respuesta.json();

    contador.textContent = `Uniformes registrados: ${registros.length} / 15`;
    tabla.innerHTML = "";

    registros.forEach((registro) => {
      const card = document.createElement("div");
      card.classList.add("registro-card");

      card.innerHTML = `
        <div class="registro-header">
          <div class="registro-nombre">${registro.nombre}</div>
          <div class="registro-numero">#${registro.numero}</div>
        </div>

        <div class="registro-info">
          <strong>Apodo:</strong> ${registro.apodo}<br>
          <strong>Talla:</strong> ${registro.talla}<br>
          <strong>Manga:</strong> ${registro.manga}<br>
          <strong>¿Ya le dieron al Negro?:</strong> ${registro.negro}<br>
          <strong>Observaciones:</strong> ${registro.observaciones || "Sin observaciones"}
        </div>

        <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">
          Eliminar registro
        </button>
      `;

      tabla.appendChild(card);
    });
  } catch (error) {
    mensaje.textContent = "❌ Error al cargar los registros.";
    mensaje.style.color = "#f87171";
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nuevoRegistro = {
    nombre: document.getElementById("nombre").value.trim(),
    apodo: document.getElementById("apodo").value.trim(),
    numero: Number(document.getElementById("numero").value),
    talla: document.getElementById("talla").value,
    manga: document.getElementById("manga").value,
    negro: document.getElementById("negro").value,
    observaciones: document.getElementById("observaciones").value.trim()
  };

  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoRegistro)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = `❌ ${resultado.mensaje}`;
      mensaje.style.color = "#f87171";
      return;
    }

    mensaje.textContent = `✅ ${resultado.mensaje}`;
    mensaje.style.color = "#4ade80";

    form.reset();
    cargarRegistros();
  } catch (error) {
    mensaje.textContent = "❌ Error al conectar con el servidor.";
    mensaje.style.color = "#f87171";
  }
});

async function eliminarRegistro(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este registro?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = `❌ ${resultado.mensaje}`;
      mensaje.style.color = "#f87171";
      return;
    }

    mensaje.textContent = `✅ ${resultado.mensaje}`;
    mensaje.style.color = "#4ade80";

    cargarRegistros();
  } catch (error) {
    mensaje.textContent = "❌ Error al eliminar registro.";
    mensaje.style.color = "#f87171";
  }
}

cargarRegistros();