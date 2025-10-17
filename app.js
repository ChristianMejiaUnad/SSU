// app.js - usa Firestore (db expuesto en window.db)

const db = window.db;

// Guardamos solo los IDs de documento localmente para asociar sesión (no datos)
function setLocalId(key, id) {
  try { localStorage.setItem(key, id); } catch(e) { console.warn(e); }
}
function getLocalId(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}

function mostrarRegistro() {
  document.getElementById('contenido').innerHTML = `
    <h2>Registro de Usuarios</h2>
    <button onclick="registroHogar()">Registro de Hogares</button>
    <button onclick="registroReciclador()">Registro de Recicladores</button>
    <button onclick="volverInicio()">Volver</button>
  `;
}

async function registroHogar() {
  const hogarId = getLocalId('hogarId');
  let hogarData = null;
  if (hogarId) {
    try {
      const doc = await db.collection('hogares').doc(hogarId).get();
      if (doc.exists) hogarData = doc.data();
    } catch(e) {
      console.error('Error leyendo hogar', e);
    }
  }

  document.getElementById('contenido').innerHTML = `
    <h3>${hogarData ? 'Datos del Hogar' : 'Registro de Hogar'}</h3>
    Dirección: <input id="direccion" value="${hogarData ? hogarData.direccion : ''}"><br>
    Barrio: <input id="barrio" value="${hogarData ? hogarData.barrio : ''}"><br>
    <button onclick="guardarHogar()">Guardar</button>
    <button onclick="volverInicio()">Volver</button>
  `;
}

async function guardarHogar() {
  const direccion = document.getElementById('direccion').value.trim();
  const barrio = document.getElementById('barrio').value.trim();
  if (!direccion || !barrio) { alert('Por favor completa todos los campos'); return; }

  const hogarId = getLocalId('hogarId');
  try {
    if (hogarId) {
      await db.collection('hogares').doc(hogarId).set({ direccion, barrio }, { merge: true });
      alert('Hogar actualizado en la nube');
    } else {
      const ref = await db.collection('hogares').add({ direccion, barrio, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      setLocalId('hogarId', ref.id);
      alert('Hogar registrado en la nube');
    }
    volverInicio();
  } catch (e) {
    console.error('Error guardando hogar', e);
    alert('Error guardando datos en la nube');
  }
}

async function registroReciclador() {
  const recicladorId = getLocalId('recicladorId');
  let recicladorData = null;
  if (recicladorId) {
    try {
      const doc = await db.collection('recicladores').doc(recicladorId).get();
      if (doc.exists) recicladorData = doc.data();
    } catch(e) { console.error(e); }
  }

  const tipos = ["Vidrio", "Plástico", "Metales", "De cocina", "Otros"];
  const tiposSeleccionados = recicladorData?.tipos || [];
  const checkboxes = tipos.map(t => {
    const checked = tiposSeleccionados.includes(t) ? 'checked' : '';
    return `<label><input type="checkbox" name="tipos" value="${t}" ${checked}> ${t}</label><br>`;
  }).join('');

  document.getElementById('contenido').innerHTML = `
    <h3>${recicladorData ? 'Datos del Reciclador' : 'Registro de Reciclador'}</h3>
    Empresa: <input id="empresa" value="${recicladorData?.empresa || ''}"><br>
    Responsable: <input id="responsable" value="${recicladorData?.responsable || ''}"><br>
    Dirección: <input id="direccionReciclador" value="${recicladorData?.direccion || ''}"><br>
    Celular: <input id="celular" value="${recicladorData?.celular || ''}"><br>
    Tipos de reciclaje:<br>
    ${checkboxes}
    <button onclick="guardarReciclador()">Guardar</button>
    <button onclick="volverInicio()">Volver</button>
  `;
}

async function guardarReciclador() {
  const empresa = document.getElementById('empresa').value.trim();
  const responsable = document.getElementById('responsable').value.trim();
  const direccion = document.getElementById('direccionReciclador').value.trim();
  const celular = document.getElementById('celular').value.trim();
  const tipos = Array.from(document.querySelectorAll('input[name="tipos"]:checked')).map(el => el.value);
  if (!empresa || !responsable || !direccion || !celular) { alert('Por favor completa todos los campos'); return; }

  const recicladorId = getLocalId('recicladorId');
  try {
    if (recicladorId) {
      await db.collection('recicladores').doc(recicladorId).set({ empresa, responsable, direccion, celular, tipos }, { merge: true });
      alert('Reciclador actualizado en la nube');
    } else {
      const ref = await db.collection('recicladores').add({ empresa, responsable, direccion, celular, tipos, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      setLocalId('recicladorId', ref.id);
      alert('Reciclador registrado en la nube');
    }
    volverInicio();
  } catch(e) {
    console.error('Error guardando reciclador', e);
    alert('Error guardando datos en la nube');
  }
}

async function mostrarReporte() {
  const hogarId = getLocalId('hogarId');
  if (!hogarId) {
    alert('Debe registrar primero el hogar (se guarda en la nube).');
    registroHogar();
    return;
  }

  const tipos = ["Vidrio", "Plástico", "Metales", "De cocina", "Otros"];
  const checkboxes = tipos.map(tipo => `<label><input type="checkbox" name="tipos" value="${tipo}"> ${tipo}</label><br>`).join('');

  document.getElementById('contenido').innerHTML = `
    <h3>Reporte de Reciclaje</h3>
    Tipos de reciclaje:<br>
    ${checkboxes}
    Cantidad:<br>
    <select id="cantidad">
      <option value="Pequeño">Pequeño (&lt;5kg)</option>
      <option value="Mediano">Mediano (5–20kg)</option>
      <option value="Grande">Grande (&gt;20kg)</option>
    </select><br>
    Día:<br>
    <select id="dia">
      <option>Lunes</option><option>Martes</option><option>Miércoles</option>
      <option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
    </select><br>
    Hora (24h): <input id="hora" type="time"><br>
    <button onclick="guardarReporte()">Terminar</button>
    <button onclick="volverInicio()">Volver</button>
  `;
}

async function guardarReporte() {
  const tipos = Array.from(document.querySelectorAll('input[name="tipos"]:checked')).map(el => el.value);
  const cantidad = document.getElementById('cantidad').value;
  const dia = document.getElementById('dia').value;
  const hora = document.getElementById('hora').value;
  const hogarId = getLocalId('hogarId');

  if (!hogarId) { alert('No se encontró un hogar asociado. Registra un hogar primero.'); return; }

  try {
    await db.collection('reportes').add({
      hogarId: hogarId,
      tipos,
      cantidad,
      dia,
      hora,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Reporte guardado en la nube');
    volverInicio();
  } catch(e) {
    console.error('Error guardando reporte', e);
    alert('Error guardando reporte en la nube');
  }
}

async function mostrarRecicladores() {
  let html = `<h2>Reportes de Reciclaje</h2>`;
  try {
    const snapshot = await db.collection('reportes').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      html += `<p>No hay reportes disponibles.</p>`;
    } else {
      html += `<table>
        <tr><th>Barrio</th><th>Dirección</th><th>Tipo</th><th>Cantidad</th><th>Día</th><th>Hora</th><th>Acción</th></tr>`;
      for (const doc of snapshot.docs) {
        const r = doc.data();
        // Obtener datos del hogar si existe
        let barrio = '-';
        let direccion = '-';
        if (r.hogarId) {
          try {
            const hdoc = await db.collection('hogares').doc(r.hogarId).get();
            if (hdoc.exists) {
              const h = hdoc.data();
              barrio = h.barrio || '-';
              direccion = h.direccion || '-';
            }
          } catch(e) { console.error('Error leyendo hogar para reporte', e); }
        }
        const tipos = (r.tipos && r.tipos.join(', ')) || '-';
        html += `<tr>
          <td>${barrio}</td>
          <td>${direccion}</td>
          <td>${tipos}</td>
          <td>${r.cantidad || '-'}</td>
          <td>${r.dia || '-'}</td>
          <td>${r.hora || '-'}</td>
          <td><button onclick="marcarRecogido('${doc.id}')"
            style="background-color: orange; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; min-width: 90px; white-space: nowrap; font-size: 14px;">
            Recogido</button></td>
        </tr>`;
      }
      html += `</table>`;
    }
  } catch(e) {
    console.error('Error cargando reportes', e);
    html += `<p>Error cargando reportes.</p>`;
  }
  html += `<br><button onclick="volverInicio()">Volver</button>`;
  document.getElementById('contenido').innerHTML = html;
}

async function marcarRecogido(id) {
  try {
    await db.collection('reportes').doc(id).delete();
    mostrarRecicladores();
  } catch(e) {
    console.error('Error borrando reporte', e);
    alert('No se pudo marcar como recogido');
  }
}

function mostrarOpcionesBorrado() {
  document.getElementById('contenido').innerHTML = `
    <h3>¿Qué desea borrar?</h3>
    <button onclick="borrarUsuario()">Borrar Usuario</button>
    <button onclick="borrarReciclaje()">Borrar Reciclaje</button>
    <button onclick="volverInicio()">Cancelar</button>
  `;
}

async function borrarUsuario() {
  const hogarId = getLocalId('hogarId');
  const recicladorId = getLocalId('recicladorId');
  try {
    if (hogarId) await db.collection('hogares').doc(hogarId).delete();
    if (recicladorId) await db.collection('recicladores').doc(recicladorId).delete();
  } catch(e) {
    console.error('Error borrando usuario en la nube', e);
  }
  try { localStorage.removeItem('hogarId'); localStorage.removeItem('recicladorId'); } catch(e){}
  alert('Datos del usuario borrados (nube + local)');
  volverInicio();
}

async function borrarReciclaje() {
  // Borrar todos los reportes (precaución)
  if (!confirm('¿Confirma borrar todos los reportes en la nube?')) return;
  try {
    const snapshot = await db.collection('reportes').get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    alert('Todos los reportes borrados');
    volverInicio();
  } catch(e) {
    console.error('Error borrando reportes', e);
    alert('No se pudieron borrar los reportes');
  }
}

function volverInicio() { document.getElementById('contenido').innerHTML = ''; }
function salir() { mostrarOpcionesBorrado(); }
