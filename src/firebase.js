// Conexion con Firebase (Ejercicio 2, punto 3).
//
// El material (ME4) usa la API antigua de Firebase 8 (firebase.firestore()).
// Aqui se usa la API modular, que es la del SDK actual y la que ya emplea ME5.
//
// Las claves se leen desde variables de entorno. Ver .env.example.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Si alguien clona el repositorio sin el archivo .env, la aplicacion sigue
// funcionando y el formulario avisa que falta la configuracion, en lugar de
// caerse al iniciar.
//
// Se exigen TODAS las variables: con una configuracion parcial, Firebase
// inicializa igual y despues falla en la primera operacion con un error poco
// claro.
export const firebaseConfigurado = Object.values(firebaseConfig).every(
  (valor) => typeof valor === 'string' && valor.trim() !== '',
)

const app = firebaseConfigurado ? initializeApp(firebaseConfig) : null

// Firestore: Ejercicio 2, puntos 3 y 4.
export const db = firebaseConfigurado ? getFirestore(app) : null

// Firebase Auth: Ejercicio 3, punto 2.
export const auth = firebaseConfigurado ? getAuth(app) : null

// Firebase Storage: Ejercicio 3, punto 2.
export const storage = firebaseConfigurado ? getStorage(app) : null

export default app
