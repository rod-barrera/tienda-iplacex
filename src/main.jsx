import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'

// Bootstrap (requisito 3.1: estilizar el formulario y los componentes con Bootstrap).
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/custom.css'

import App from './App.jsx'

// En la web se usa BrowserRouter: Netlify devuelve index.html para cualquier
// ruta gracias a public/_redirects.
//
// En el APK se usa HashRouter. cordova-android sirve la aplicacion desde
// https://localhost mediante WebViewAssetLoader, que resuelve archivos reales
// dentro de www. Una ruta como /producto/1 no existe como archivo, asi que una
// recarga dentro del WebView no encontraria nada. Con el hash, la ruta nunca
// sale del index.html.
//
// El modo "movil" lo fija el script build:movil (vite build --mode movil).
const esMovil = import.meta.env.MODE === 'movil'
const Router = esMovil ? HashRouter : BrowserRouter

// Boton fisico Atras de Android.
//
// cordova.js sustituye document.addEventListener para sus propios eventos: al
// suscribirse a "backbutton" avisa a la capa nativa de que el boton queda
// delegado a JavaScript. Sin cordova.js cargado ese evento no existe y Android
// cierra la actividad en lugar de retroceder, que era el fallo observado.
//
// No se pasa { once: true } porque el override de Cordova solo acepta
// (evento, manejador, capture) y descarta el tercer argumento. Da igual:
// "deviceready" se emite una unica vez y su canal es persistente, asi que
// suscribirse despues de que se haya emitido ejecuta el manejador igualmente.
if (esMovil) {
  document.addEventListener('deviceready', () => {
    document.addEventListener('backbutton', () => {
      const rutaActual = window.location.hash.replace(/^#/, '') || '/'

      // Fuera de la raiz se retrocede en el historial del WebView. En la raiz
      // se cierra la aplicacion, que es la convencion de Android.
      if (rutaActual !== '/') {
        window.history.back()
        return
      }

      navigator.app?.exitApp()
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
