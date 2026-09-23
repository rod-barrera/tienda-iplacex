# Tienda Iplacex

Aplicación web desarrollada con React para el examen de la asignatura
**Programación de Componentes** (Escuela de Informática y Telecomunicaciones,
Iplacex).

Es una tienda sencilla: un catálogo de productos, un carrito, un formulario de
pedido validado que se guarda en Cloud Firestore, autenticación con correo y
contraseña, y subida opcional de un comprobante a Firebase Storage.

---

## Enlaces

- **Aplicación:** https://tienda-iplacex-rodrigo.netlify.app
- **Repositorio:** https://github.com/rod-barrera/tienda-iplacex

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| React | 19.3.0 | Biblioteca de interfaz |
| Vite | 8.3.0 | Entorno de desarrollo y compilación |
| react-router-dom | 7.18.4 | Enrutamiento con y sin parámetros |
| Bootstrap | 5.3.8 | Estilos y diseño responsive |
| simple-react-validator | 1.6.2 | Validación del formulario |
| firebase | 12.19.0 | Firestore, Authentication y Storage |
| oxlint | 1.85.0 | Análisis estático |
| Node.js | 22.x | Entorno de ejecución (ver `.nvmrc`); entorno local 22.20.0 |

---

## Requisitos previos

- Node.js 22.12 o superior
- Una cuenta de Firebase con un proyecto que tenga habilitados Firestore,
  Authentication (correo y contraseña) y Storage

---

## Instalación

```bash
npm install
```

Copiar `.env.example` como `.env` y completar los valores del proyecto de
Firebase. Se obtienen en la consola de Firebase, en
**Configuración del proyecto → Tus apps → App web → Configuración del SDK**.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

El archivo `.env` no se versiona. Si falta o está incompleto, la aplicación
arranca igualmente y el formulario avisa de que falta la configuración, en
lugar de mostrar una pantalla en blanco.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve localmente el resultado de `build` |
| `npm run lint` | Análisis estático con oxlint |

---

## Estructura del proyecto

```
tienda-iplacex/
├── public/
│   ├── img/                     Imágenes de los productos
│   └── _redirects               Regla SPA para Netlify
├── src/
│   ├── main.jsx                 Punto de entrada, router y estilos
│   ├── App.jsx                  Composición de la página
│   ├── firebase.js              Inicialización de Firestore, Auth y Storage
│   ├── data/
│   │   └── productos.js         Catálogo local
│   ├── components/
│   │   ├── ListaProductos.jsx   Componente padre, estado del carrito y rutas
│   │   ├── Producto.jsx         Componente hijo del catálogo
│   │   ├── Carrito.jsx          Contenido del carrito
│   │   ├── DetalleProducto.jsx  Vista de detalle de un producto
│   │   ├── FormularioPedido.jsx Formulario, validación, Firestore y Storage
│   │   ├── Auth.jsx             Registro, inicio y cierre de sesión
│   │   └── Footer.jsx           Componente estático
│   └── styles/
│       └── custom.css           Estilos propios que complementan Bootstrap
├── firestore.rules              Reglas de Cloud Firestore
├── storage.rules                Reglas de Firebase Storage
├── .env.example                 Plantilla de variables de entorno
└── .nvmrc                       Versión de Node
```

---

## Cumplimiento de los requisitos del examen

### Ejercicio 1

| Requisito | Dónde se implementa |
|---|---|
| Crear un proyecto React | Proyecto completo, creado con Vite |
| Componente padre: lista de productos | `ListaProductos.jsx` |
| Componente hijo: renderiza producto y botón | `Producto.jsx` |
| Implementar `map()` para listar productos | `ListaProductos.jsx`, método `renderCatalogo()` |
| Comunicación padre-hijo con props | `ListaProductos.jsx` pasa `producto` a `Producto.jsx` |
| Comunicación hijo-padre con callbacks | `onAgregar` en `Producto.jsx` y `onQuitar` en `Carrito.jsx` |
| Actualizar el carrito con state y `this.setState({})` | `ListaProductos.jsx`, métodos `agregarAlCarrito()` y `quitarDelCarrito()` |

`ListaProductos` es un componente de clase porque el examen pide explícitamente
`this.setState({})`. Las rutas se resuelven dentro de ese componente para que no
se desmonte al navegar al detalle y el carrito no se pierda.

### Ejercicio 2

| Requisito | Dónde se implementa |
|---|---|
| Crear un formulario con React | `FormularioPedido.jsx`, con inputs controlados por el estado |
| Configurar el validador | `FormularioPedido.jsx`, instancia de `SimpleReactValidator` |
| Conectar la aplicación a Firebase | `firebase.js` |
| Guardar los datos del formulario en Firestore | `FormularioPedido.jsx`, `addDoc` sobre la colección `pedidos` |

Reglas de validación aplicadas:

| Campo | Reglas |
|---|---|
| Nombre | obligatorio, mínimo 3 caracteres |
| Correo electrónico | obligatorio, formato de correo |
| Teléfono | obligatorio, solo números, entre 8 y 12 caracteres |
| Dirección | obligatorio, mínimo 5 caracteres |
| Comprobante | opcional; JPG, PNG, WEBP o PDF. Tamaño del comprobante: mayor que 0 y máximo 5 MiB (mostrado como «5 MB» en la interfaz) |

**Sobre el nombre de la librería.** El enunciado del examen la menciona como
`react-simple-validator`, pero ese paquete no existe en npm. El código del
material de estudio (ME 3, página 9) importa `simple-react-validator`, que es
la librería real y la que se usa en este proyecto.

### Ejercicio 3

| Requisito | Dónde se implementa | Estado |
|---|---|---|
| Estilizar el formulario y componentes con Bootstrap | Todos los componentes; `custom.css` complementa | Completo |
| Implementar Firebase Auth | `Auth.jsx` y `firebase.js` | Completo |
| Implementar Firebase Storage | `FormularioPedido.jsx` y `firebase.js` | Completo |
| Configurar Android Studio, Gradle y Cordova | `movil/config.xml`, `movil/package.json` | Completo |
| Exportar el proyecto a APK | Script `build:movil` y Cordova | Completo |
| Firmar el APK y probarlo en un dispositivo | `zipalign` + `apksigner`; probado en emulador | Completo |

Los detalles del empaquetado están en la sección
[Empaquetado Android (APK)](#empaquetado-android-apk).

### Contenidos cubiertos de forma preventiva

Los siguientes aparecen en los contenidos asociados del examen, aunque ningún
ejercicio los pide de forma literal:

| Contenido | Dónde |
|---|---|
| Enrutamiento sin parámetros | Ruta `/` en `ListaProductos.jsx` |
| Enrutamiento con parámetros | Ruta `/producto/:id`, leída con `useParams()` en `DetalleProducto.jsx` |
| Componente estático | `Footer.jsx` |
| Componentes dinámicos | `ListaProductos.jsx` y `Carrito.jsx` |
| Métodos del ciclo de vida | `Auth.jsx`, con `componentDidMount()` y `componentWillUnmount()` |
| Renderizado condicional | Carrito vacío en `Carrito.jsx`, estado de sesión en `Auth.jsx` |
| Listas y keys | `key={producto.id}` en `ListaProductos.jsx` |

---

## Modelo de datos

Los pedidos se guardan en la colección `pedidos` de Cloud Firestore.

| Campo | Tipo | Presencia |
|---|---|---|
| `nombre`, `email`, `telefono`, `direccion` | string | Siempre |
| `productos` | array de objetos con `id`, `nombre`, `precio` y `cantidad` | Siempre |
| `total` | number | Siempre |
| `fecha` | timestamp del servidor | Siempre |
| `uid`, `correoUsuario` | string | Solo con sesión iniciada |
| `comprobantePath`, `comprobanteNombre`, `comprobanteTipo` | string | Solo si se adjunta comprobante |

Los comprobantes se guardan en Firebase Storage bajo
`comprobantes/{uid}/{nombre-unico}`. El nombre se sanitiza y su extensión se
deriva del tipo MIME validado, no del nombre original.

**No se almacena la URL de descarga del archivo.** `getDownloadURL()` devuelve
una URL con un token que funciona como enlace compartible y no pasa por las
reglas de seguridad, así que se guarda únicamente la ruta interna.

## Reglas de seguridad

Los archivos `firestore.rules` y `storage.rules` están versionados en el
repositorio para que la configuración sea revisable. **No se aplican solos:**
hay que publicarlos manualmente desde la consola de Firebase.

En resumen:

- La aplicación solo **crea** documentos en `pedidos`. Lectura, actualización y
  eliminación están denegadas desde el cliente.
- Un pedido anónimo no puede incluir datos de sesión ni de comprobante.
- Un pedido autenticado debe declarar su propio `uid`, y si adjunta comprobante,
  la ruta tiene que apuntar a su propia carpeta.
- En Storage, cada usuario solo puede crear archivos dentro de
  `comprobantes/{su-uid}/`, con tipo y tamaño validados en el servidor. La
  lectura, la actualización y el borrado están denegados.

Dos puntos que deben mantenerse sincronizados a mano:

- El límite de **5 MiB** debe coincidir entre la constante `MAX_BYTES` de
  `FormularioPedido.jsx` y `storage.rules`.
- La lista de **tipos MIME permitidos** debe coincidir entre
  `FormularioPedido.jsx`, `storage.rules` y `firestore.rules`.

---

## Despliegue

El sitio se despliega en Netlify conectando este repositorio.

| Campo | Valor |
|---|---|
| Base directory | *(vacío)* |
| Build command | `npm run build` |
| Publish directory | `dist` |

Las seis variables `VITE_FIREBASE_*` deben cargarse en
**Site configuration → Environment variables** de Netlify, porque el archivo
`.env` no se versiona.

El archivo `public/_redirects` contiene la regla que devuelve `index.html` para
cualquier ruta, necesaria en una aplicación de una sola página. Sin ella,
entrar directamente a una URL como `/producto/1` devolvería un 404.

Como medida de configuración y compatibilidad, el dominio de Netlify se añade a
la lista de dominios autorizados en
**Firebase → Authentication → Settings → Authorized domains**.

---

## Empaquetado Android (APK)

La aplicación se empaqueta para Android con Apache Cordova. El proyecto Cordova
vive en `movil/` y reutiliza el mismo código fuente que la versión web.

### Herramientas

| Componente | Versión |
|---|---|
| Cordova CLI | 13.0.0 (instalado localmente en `movil/`) |
| cordova-android | 15.1.0 |
| Android SDK Platform | 36 |
| Android Build-Tools | 36.0.0 |
| JDK para Cordova | Temurin 17 (vía `CORDOVA_JAVA_HOME`) |
| Gradle | 8.14.2 |

El JDK del sistema sigue siendo el 21. Cordova usa el 17 mediante la variable
`CORDOVA_JAVA_HOME`, que tiene prioridad sobre `JAVA_HOME` solo para sus
compilaciones.

### Variables de entorno

```
ANDROID_HOME       C:\Users\<usuario>\AppData\Local\Android\Sdk
CORDOVA_JAVA_HOME  ruta del JDK 17
PATH               %ANDROID_HOME%\platform-tools
                   %ANDROID_HOME%\cmdline-tools\latest\bin
                   %ANDROID_HOME%\build-tools\36.0.0
                   <carpeta de Gradle>\bin
```

### Diferencias entre la versión web y la móvil

El mismo código produce dos salidas distintas según el modo de Vite:

| | `npm run build` | `npm run build:movil` |
|---|---|---|
| Destino | `dist/` | `movil/www/` |
| `base` | `/` | `./` |
| Enrutador | `BrowserRouter` | `HashRouter` |
| `cordova.js` | No | Sí |

Dentro del APK la aplicación se sirve desde `https://localhost` mediante
`WebViewAssetLoader`, que resuelve archivos reales dentro de `www`. Una ruta
como `/producto/1` no existe como archivo, así que se usa `HashRouter`: la ruta
viaja en el fragmento y nunca sale de `index.html`.

El botón físico Atrás requiere que `cordova.js` esté cargado, porque es quien
habilita el evento `backbutton` y avisa a la capa nativa de que el botón queda
delegado a JavaScript. Sin él, Android cierra la actividad en lugar de
retroceder. La inyección del script y un `cordova_plugins.js` con la lista de
plugins vacía los genera un plugin de Vite que solo se activa en modo `movil`,
de modo que la versión web no recibe nada de Cordova.

### Compilar

```bash
npm run build:movil
```

Después, desde `movil/`:

```bash
npx -- cordova build android --release -- --packageType=apk
```

El doble `--` es necesario: sin el primero, `npx` consume el separador y el
parámetro `--packageType=apk` no llega a Cordova, que genera un AAB en lugar
de un APK.

La salida es `movil/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`.

### Firmar

El material de estudio describe `jarsigner` seguido de `zipalign`. Ese
procedimiento produce una firma v1 (JAR signing) únicamente, y Android 11 o
superior rechaza instalar un APK con `targetSdkVersion` 30 o mayor que solo
tenga v1. Como este proyecto apunta a la API 36, se usa `apksigner`, que firma
con los esquemas v2 y v3, y el orden se invierte: primero se alinea y después
se firma.

Generación de la clave:

```bash
keytool -genkeypair -v -keystore <ruta>\tienda-iplacex.jks -storetype JKS -alias tienda-iplacex -keyalg RSA -keysize 2048 -validity 10000
```

Alineación y firma:

```bash
zipalign -v -p 4 app-release-unsigned.apk tienda-iplacex-1.0.0-alineado.apk
```

```bash
apksigner sign --ks <ruta>\tienda-iplacex.jks --ks-key-alias tienda-iplacex --out tienda-iplacex-1.0.0.apk tienda-iplacex-1.0.0-alineado.apk
```

Las contraseñas no se pasan por parámetro: `keytool` y `apksigner` las piden de
forma interactiva, así no quedan en el historial de la terminal. **El keystore
se guarda fuera del repositorio y nunca se versiona.**

### Verificar

```bash
zipalign -c -v 4 tienda-iplacex-1.0.0.apk
apksigner verify --verbose --print-certs tienda-iplacex-1.0.0.apk
aapt2 dump badging tienda-iplacex-1.0.0.apk
certutil -hashfile tienda-iplacex-1.0.0.apk SHA256
```

### APK entregado

| | |
|---|---|
| Archivo | `tienda-iplacex-1.0.0.apk` |
| Tamaño | 3.061.055 bytes |
| SHA-256 | `5513ABB616B7EEEA01A0CFF33D314FF5CB019FC0F05D386D98C6A8A83CDCF476` |
| Paquete | `cl.iplacex.tiendaiplacex` |
| versionName | 1.0.0 |
| versionCode | 10000 |
| minSdkVersion | 24 |
| targetSdkVersion | 36 |
| Alineación | Correcta (4 bytes) |
| Firma | APK Signature Scheme v2 y v3 |

El APK no se versiona en el repositorio: se entrega aparte, junto con el ZIP.

### Prueba de instalación

El APK firmado se instaló y se probó en **Android Emulator, perfil Medium
Phone, API 36.1**. Se verificó:

- Apertura de la aplicación.
- Catálogo con las cinco imágenes.
- Vista de detalle y regreso al catálogo.
- Botón físico Atrás desde el detalle y desde la raíz.
- Rotación horizontal y vertical.
- Inicio y cierre de sesión con Firebase Auth.
- Logcat sin errores propios de la aplicación.

El enunciado del examen pide probar el APK en un dispositivo. La verificación
se realizó sobre un dispositivo virtual, no sobre un teléfono físico.

---

## Limitaciones conocidas

- El carrito vive en memoria: al recargar la página se vacía. No se añadió
  persistencia porque el examen no la pide.
- `total` no se verifica contra la suma de `productos` en las reglas de
  Firestore: el lenguaje de reglas no permite recorrer un arreglo para sumarlo.
- La validación del tipo de archivo se basa en el MIME que declara el
  navegador; no inspecciona el contenido real del archivo.
- Si la subida del comprobante termina bien pero falla la escritura en
  Firestore, el archivo queda huérfano en Storage. No se implementó limpieza
  automática para no abrir permisos de borrado en las reglas.
- La aplicación no implementa descarga ni visualización de los comprobantes.
- Vite advierte en la compilación que el fragmento principal supera los 500 kB
  antes de comprimir, debido sobre todo al SDK de Firebase. No se añadió
  división de código porque queda fuera del alcance del examen.

---

## Autor

Rodrigo Barrera — Programación de Componentes, Iplacex.
