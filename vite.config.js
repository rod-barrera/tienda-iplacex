import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Plugin que solo se activa en el modo "movil". Hace dos cosas:
//
// 1. Emite un cordova_plugins.js con la lista de plugins vacia.
//    cordova-android 15.1.0 solo aporta cordova.js en su platform_www y no
//    genera cordova_plugins.js cuando el proyecto no tiene plugins. El
//    cargador de cordova.js lo pide igualmente, asi que Logcat registraba
//    FileNotFoundException. La aplicacion funcionaba, porque ese cargador
//    interpreta el fallo como "sin plugins", pero el stub evita el error.
//
// 2. Inyecta <script src="cordova.js"> al principio del body. Ese archivo no
//    existe en movil/www: lo aporta cordova-android cuando "cordova prepare"
//    copia todo a los assets del APK. Al ser un script clasico se ejecuta
//    antes que el bundle de React, que es un modulo y por tanto diferido, de
//    modo que cordova.js ya esta listo cuando main.jsx se suscribe a
//    "deviceready".
//
// Sin este plugin no hay evento "backbutton" y el boton fisico Atras cierra
// la aplicacion en vez de retroceder.
const cordovaScriptPlugin = {
  name: 'cordova-script',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'cordova_plugins.js',
      source: `cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [];
module.exports.metadata = {};
});
`,
    })
  },
  transformIndexHtml: {
    order: 'post',
    handler() {
      return [
        {
          tag: 'script',
          attrs: { src: 'cordova.js' },
          injectTo: 'body-prepend',
        },
      ]
    },
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'movil' ? [cordovaScriptPlugin] : [])],

  // La web se sirve desde la raiz del dominio; el APK se sirve desde
  // https://localhost dentro del WebView, donde las rutas relativas son
  // mas seguras. El modo "movil" solo lo usa el script build:movil.
  base: mode === 'movil' ? './' : '/',
}))
