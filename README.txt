README - Despliegue PWA Reciclaje-SSU con Firestore
===================================================

Archivos incluidos:
- index.html
- app.js
- sw.js
- manifest.json
- icono.png (placeholder - reemplaza por tu icono)
- README.txt

Resumen:
Esta versión de la PWA guarda los datos de Hogares, Recicladores y Reportes en Firebase Firestore.
Se almacena localmente únicamente el ID del documento (hogarId, recicladorId) para asociar la sesión del dispositivo con los datos en la nube. Si prefieres identificar usuarios, te recomiendo habilitar Firebase Authentication.

Pasos para desplegar en Firebase Hosting
----------------------------------------

1) Instala Firebase CLI (si aún no lo tienes):
   - Necesitas Node.js instalado.
   - Ejecuta:
     npm install -g firebase-tools
     firebase login

2) Inicializa tu proyecto localmente (en la carpeta que contiene estos archivos):
   - Abre terminal en la carpeta donde descomprimiste los archivos.
   - Ejecuta:
     firebase init
   - Selecciona "Hosting".
   - Cuando te pregunte por el proyecto, elige "Reciclaje-SSU" (tu proyecto en Firebase).
   - Define la carpeta pública: "."  (o "public" si prefieres mover los archivos ahí).
   - Responde "No" a configurar como SPA si no lo deseas; si lo configuras como SPA, establece index.html como fallback.

3) Configura reglas de Firestore para desarrollo:
   - En Firebase Console > Firestore > Rules, puedes usar reglas abiertas temporalmente para pruebas:
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
   - IMPORTANTE: Estas reglas permiten acceso público. Cambia a reglas seguras antes de producción.

4) Despliega:
   - En la terminal:
     firebase deploy --only hosting
   - Al finalizar recibirás la URL tipo:
     https://<tu-proyecto>.web.app

Notas importantes
-----------------
- Los datos se guardan en Firestore en las colecciones: hogares, recicladores, reportes.
- Para asociar persistentemente un usuario a varios dispositivos debes usar Firebase Authentication (opcional).
- Si quieres que las notificaciones push funcionen en segundo plano necesitarás integrar Firebase Cloud Messaging (FCM) y un service worker adicional.

Si quieres, preparo también un archivo `firebase.json` y `.firebaserc` para facilitar el deploy. ¿Lo incluyo?