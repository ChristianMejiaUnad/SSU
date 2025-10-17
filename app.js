function solicitarPermisoNotificaciones() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permiso de notificaciones concedido.');
      }
    });
  }
}

function enviarNotificacion(titulo, mensaje) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensaje,
      icon: 'icono.png'
    });
  }
}

solicitarPermisoNotificaciones();


function mostrarRegistro() {
  document.getElementById('contenido').innerHTML = `
    <h2>Registro de Usuarios</h2>
    <button onclick="registroHogar()">Registro de Hogares</button>
    <button onclick="registroReciclador()">Registro de Recicladores</button>
    <button onclick="volverInicio()">Volver</button>
  `;
}

function registroHogar() {
  let hogar = JSON.parse(localStorage.getItem('hogar'));
  if (hogar) {
    document.getElementById('contenido').innerHTML = `
      <h3>Datos del Hogar</h3>
      Dirección: <input id='direccion' value='${hogar.direccion}'><br>
      Barrio: <input id='barrio' value='${hogar.barrio}'><br>
      <button onclick="guardarHogar()">Guardar</button>
      <button onclick="volverInicio()">Volver</button>
    `;
  } else {
    document.getElementById('contenido').innerHTML = `
      <h3>Registro de Hogar</h3>
      Dirección: <input id='direccion'><br>
      Barrio: <input id='barrio'><br>
      <button onclick="guardarHogar()">Guardar</button>
      <button onclick="volverInicio()">Volver</button>
    `;
  }
}

function guardarHogar() {
  const direccion = document.getElementById('direccion').value.trim();
  const barrio = document.getElementById('barrio').value.trim();
  if (!direccion || !barrio) {
    alert('Por favor completa todos los campos');
    return;
  }
  localStorage.setItem('hogar', JSON.stringify({ direccion, barrio }));
  alert('Datos guardados');
  volverInicio();
}


function registroReciclador() {
  let reciclador = JSON.parse(localStorage.getItem('reciclador'));
  const tipos = ["Vidrio", "Plástico", "Metales", "De cocina", "Otros"];
  let tiposSeleccionados = Array.isArray(reciclador?.tipos) ? reciclador.tipos : [];
  let checkboxes = tipos.map(tipo => {
    let checked = tiposSeleccionados.includes(tipo) ? "checked" : "";
    return `<label><input type='checkbox' name='tipos' value='${tipo}' ${checked}> ${tipo}</label><br>`;
  }).join("");

  document.getElementById('contenido').innerHTML = `
    <h3>Registro de Reciclador</h3>
    Empresa: <input id='empresa' value='${reciclador?.empresa || ""}'><br>
    Responsable: <input id='responsable' value='${reciclador?.responsable || ""}'><br>
    Dirección: <input id='direccionReciclador' value='${reciclador?.direccion || ""}'><br>
    Celular: <input id='celular' value='${reciclador?.celular || ""}'><br>
    Tipos de reciclaje:<br>
    ${checkboxes}
    <button onclick='guardarReciclador()'>Guardar</button>
    <button onclick='volverInicio()'>Volver</button>
  `;
}

function guardarReciclador() {
  const empresa = document.getElementById('empresa').value.trim();
  const responsable = document.getElementById('responsable').value.trim();
  const direccion = document.getElementById('direccionReciclador').value.trim();
  const celular = document.getElementById('celular').value.trim();
  const tipos = Array.from(document.querySelectorAll("input[name='tipos']:checked")).map(el => el.value);

  if (!empresa || !responsable || !direccion || !celular) {
    alert("Por favor completa todos los campos");
    return;
  }

  const reciclador = { empresa, responsable, direccion, celular, tipos };
  localStorage.setItem('reciclador', JSON.stringify(reciclador));
  alert('Reciclador guardado correctamente');
  volverInicio();
}


function mostrarReporte() {
  let hogar = JSON.parse(localStorage.getItem('hogar'));
  if (!hogar) {
    alert('Debe registrar primero el hogar');
    registroHogar();
    return;
  }

  const tipos = ["Vidrio", "Plástico", "Metales", "De cocina", "Otros"];
  let checkboxes = tipos.map(tipo => `<label><input type='checkbox' name='tipos' value='${tipo}'> ${tipo}</label><br>`).join("");

  document.getElementById('contenido').innerHTML = `
    <h3>Reporte de Reciclaje</h3>
    Tipos de reciclaje:<br>
    ${checkboxes}
    Cantidad:<br>
    <select id='cantidad'>
      <option value='Pequeño'>Pequeño (&lt;5kg)</option>
      <option value='Mediano'>Mediano (5–20kg)</option>
      <option value='Grande'>Grande (&gt;20kg)</option>
    </select><br>
    Día:<br>
    <select id='dia'>
      <option>Lunes</option>
      <option>Martes</option>
      <option>Miércoles</option>
      <option>Jueves</option>
      <option>Viernes</option>
      <option>Sábado</option>
      <option>Domingo</option>
    </select><br>
    Hora (24h): <input id='hora' type='time'><br>
    <button onclick='guardarReporte()'>Terminar</button>
    <button onclick='volverInicio()'>Volver</button>
  `;
}

function guardarReporte() {
  const tipos = Array.from(document.querySelectorAll("input[name='tipos']:checked")).map(el => el.value);
  const cantidad = document.getElementById('cantidad').value;
  const dia = document.getElementById('dia').value;
  const hora = document.getElementById('hora').value;
  const hogar = JSON.parse(localStorage.getItem('hogar')) || {};

  let reportes = JSON.parse(localStorage.getItem('reportes')) || [];
  reportes.push({
    barrio: hogar.barrio || "-",
    direccion: hogar.direccion || "-",
    tipos,
    cantidad,
    dia,
    hora
  });
  localStorage.setItem('reportes', JSON.stringify(reportes));

  alert('Reporte guardado');
  volverInicio();
}


function mostrarRecicladores() {
  const reciclajes = JSON.parse(localStorage.getItem("reportes")) || [];
  let html = `<h2>Reportes de Reciclaje</h2>`;

  if (reciclajes.length === 0) {
    html += `<p>No hay reportes disponibles.</p>`;
  } else {
    html += `<table border='1'>
      <tr>
        <th>Barrio</th>
        <th>Dirección</th>
        <th>Tipo</th>
        <th>Cantidad</th>
        <th>Día</th>
        <th>Hora</th>
        <th>Acción</th>
      </tr>`;
    reciclajes.forEach((r, index) => {
      html += `<tr>
        <td>${r.barrio || "-"}</td>
        <td>${r.direccion || "-"}</td>
        <td>${(r.tipos && r.tipos.join(", ")) || "-"}</td>
        <td>${r.cantidad || "-"}</td>
        <td>${r.dia || "-"}</td>
        <td>${r.hora || "-"}</td>
        <td>
          <button onclick='marcarRecogido(${index})'
            style='background-color: orange; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; min-width: 90px; white-space: nowrap; font-size: 14px;'>
            Recogido
          </button>
        </td>
      </tr>`;
    });
    html += `</table>`;
  }

  html += `<br><button onclick='volverInicio()'>Volver</button>`;
  document.getElementById("contenido").innerHTML = html;
}

function marcarRecogido(index) {
  let reciclajes = JSON.parse(localStorage.getItem("reportes")) || [];
  reciclajes.splice(index, 1);
  localStorage.setItem("reportes", JSON.stringify(reciclajes));
  mostrarRecicladores();
}


function mostrarOpcionesBorrado() {
  document.getElementById('contenido').innerHTML = `
    <h3>¿Qué desea borrar?</h3>
    <button onclick="borrarUsuario()">Borrar Usuario</button>
    <button onclick="borrarReciclaje()">Borrar Reciclaje</button>
    <button onclick="volverInicio()">Cancelar</button>
  `;
}

function borrarUsuario() {
  localStorage.removeItem('hogar');
  localStorage.removeItem('reciclador');
  alert('Datos del usuario borrados');
  volverInicio();
}

function borrarReciclaje() {
  localStorage.removeItem('reportes');
  alert('Datos de reciclaje borrados');
  volverInicio();
}

function volverInicio() {
  document.getElementById('contenido').innerHTML = '';
}

function salir() {
  mostrarOpcionesBorrado();
}
