import { Component } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

import { auth, firebaseConfigurado } from '../firebase.js'

// Ejercicio 3, punto 2: Firebase Auth con correo y contrasena.
//
// Franja compacta sobre el catalogo. Si hay sesion muestra el correo y el
// boton de cerrar sesion; si no, el formulario de acceso o de registro.

// Los codigos que devuelve Firebase no son legibles para el usuario final.
const ERRORES = {
  'auth/email-already-in-use': 'Ese correo ya está registrado.',
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos.',
  'auth/network-request-failed': 'No se pudo conectar con Firebase.',
}

const LARGO_MINIMO_PASSWORD = 6

class Auth extends Component {
  constructor(props) {
    super(props)

    this.state = {
      usuario: null,
      // Sin Firebase configurado no hay sesion que restaurar, asi que no se
      // queda esperando.
      cargando: firebaseConfigurado,
      modo: 'login', // 'login' o 'registro'
      email: '',
      password: '',
      procesando: false,
      mensaje: null,
    }

    this.desuscribir = null

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.cerrarSesion = this.cerrarSesion.bind(this)
    this.cambiarModo = this.cambiarModo.bind(this)
  }

  // Metodos del ciclo de vida: onAuthStateChanged avisa cada vez que cambia la
  // sesion, incluida la restauracion automatica al recargar la pagina.
  componentDidMount() {
    if (!firebaseConfigurado) {
      return
    }

    this.desuscribir = onAuthStateChanged(auth, (usuario) => {
      this.setState({ usuario, cargando: false })
    })
  }

  // Se cancela la suscripcion para no dejar el listener colgando.
  componentWillUnmount() {
    if (this.desuscribir) {
      this.desuscribir()
    }
  }

  handleChange(evento) {
    const { name, value } = evento.target
    this.setState({ [name]: value })
  }

  cambiarModo() {
    this.setState((estadoPrevio) => ({
      modo: estadoPrevio.modo === 'login' ? 'registro' : 'login',
      mensaje: null,
    }))
  }

  async handleSubmit(evento) {
    evento.preventDefault()

    const { modo, email, password } = this.state

    if (!firebaseConfigurado) {
      this.setState({
        mensaje: { ok: false, texto: 'Falta configurar Firebase (.env).' },
      })
      return
    }

    // Firebase rechaza contrasenas cortas con un codigo poco claro, asi que se
    // avisa antes de llamar al servicio.
    if (password.length < LARGO_MINIMO_PASSWORD) {
      this.setState({
        mensaje: {
          ok: false,
          texto: `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`,
        },
      })
      return
    }

    this.setState({ procesando: true, mensaje: null })

    try {
      const credencial =
        modo === 'registro'
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password)

      this.setState({
        email: '',
        password: '',
        procesando: false,
        mensaje: {
          ok: true,
          texto:
            modo === 'registro'
              ? `Cuenta creada e iniciada como ${credencial.user.email}`
              : `Sesión iniciada como ${credencial.user.email}`,
        },
      })
    } catch (error) {
      this.setState({
        procesando: false,
        mensaje: {
          ok: false,
          texto: ERRORES[error.code] ?? `No se pudo completar: ${error.code}`,
        },
      })
    }
  }

  async cerrarSesion() {
    try {
      await signOut(auth)
      this.setState({ mensaje: { ok: true, texto: 'Sesión cerrada.' } })
    } catch (error) {
      this.setState({
        mensaje: {
          ok: false,
          texto: ERRORES[error.code] ?? 'No se pudo cerrar la sesión.',
        },
      })
    }
  }

  render() {
    const { usuario, cargando, modo, email, password, procesando, mensaje } =
      this.state

    if (cargando) {
      return (
        <div className="border rounded bg-white p-3 mb-4">
          <span className="text-secondary small">Comprobando sesión...</span>
        </div>
      )
    }

    return (
      <div className="border rounded bg-white p-3 mb-4">
        {usuario ? (
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="small">
              Sesión iniciada como <strong>{usuario.email}</strong>
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={this.cerrarSesion}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form
            className="d-flex flex-column flex-md-row flex-md-wrap align-items-stretch align-items-md-end gap-2"
            onSubmit={this.handleSubmit}
            noValidate
          >
            <div className="flex-grow-1">
              <label className="form-label small mb-1" htmlFor="auth-email">
                Correo
              </label>
              <input
                className="form-control form-control-sm"
                id="auth-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={this.handleChange}
              />
            </div>

            <div className="flex-grow-1">
              <label className="form-label small mb-1" htmlFor="auth-password">
                Contraseña
              </label>
              <input
                className="form-control form-control-sm"
                id="auth-password"
                name="password"
                type="password"
                autoComplete={
                  modo === 'registro' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={this.handleChange}
              />
            </div>

            <button
              className="btn btn-primary btn-sm"
              type="submit"
              disabled={procesando}
            >
              {procesando
                ? 'Procesando...'
                : modo === 'registro'
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'}
            </button>

            <button
              className="btn btn-link btn-sm"
              type="button"
              onClick={this.cambiarModo}
            >
              {modo === 'registro'
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </form>
        )}

        {/* Renderizado condicional del resultado de la operacion. */}
        {mensaje && (
          <div
            className={`alert py-2 px-3 mt-3 mb-0 small ${
              mensaje.ok ? 'alert-success' : 'alert-danger'
            }`}
            role="alert"
          >
            {mensaje.texto}
          </div>
        )}
      </div>
    )
  }
}

export default Auth
