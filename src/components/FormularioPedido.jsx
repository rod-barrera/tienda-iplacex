import { Component, createRef } from 'react'
import SimpleReactValidator from 'simple-react-validator'
import 'simple-react-validator/dist/locale/es'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'

import { auth, db, storage, firebaseConfigurado } from '../firebase.js'

// Ejercicio 2.
//
//   1. Formulario en React, con inputs controlados por el state.
//   2. Validaciones con simple-react-validator.
//   3 y 4. Al enviar, el pedido se guarda en la coleccion "pedidos" de Firestore.
//
// Ejercicio 3, punto 2: el comprobante opcional se sube a Firebase Storage.
//
// Nota sobre el nombre de la libreria: el examen la llama
// "react-simple-validator", pero ese paquete no existe en npm. El codigo del
// material (ME3, pagina 9) importa "simple-react-validator", que es la
// libreria real y la que se usa aqui.
const CAMPOS_VACIOS = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
}

// Nombre con que cada campo se registra en el validador. Aparece en los
// mensajes de error y sirve tambien para ocultarlos uno a uno.
const CAMPO = {
  nombre: 'Nombre',
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  direccion: 'Dirección',
}

// Tipos aceptados y la extension con la que se guarda cada uno.
const TIPOS_PERMITIDOS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

// Debe coincidir con el limite de storage.rules.
const MAX_BYTES = 5 * 1024 * 1024

// Validacion en cliente. Es solo la primera barrera: la definitiva son las
// reglas de Storage, porque cualquiera puede saltarse el JavaScript.
//
// Ojo: archivo.type es el MIME que declara el navegador a partir del archivo,
// no una inspeccion de su contenido. Para este examen es suficiente.
function validarArchivo(archivo) {
  if (!TIPOS_PERMITIDOS[archivo.type]) {
    return 'Solo se aceptan archivos JPG, PNG, WEBP o PDF.'
  }
  if (archivo.size === 0) {
    return 'El archivo está vacío.'
  }
  if (archivo.size > MAX_BYTES) {
    return 'El archivo no puede superar los 5 MB.'
  }
  return null
}

// Nombre unico dentro de la carpeta del usuario.
//
// El nombre original se conserva solo como base legible, despues de quitarle
// tildes, dejar unicamente letras, numeros y guiones, y truncarlo. La
// estructura de la ruta nunca depende de el. La extension sale del tipo ya
// validado, no del nombre, para que un "factura.exe" declarado como image/png
// no aterrice con extension ejecutable.
function nombreUnico(archivo) {
  const extension = TIPOS_PERMITIDOS[archivo.type]
  const punto = archivo.name.lastIndexOf('.')

  const base =
    (punto > 0 ? archivo.name.slice(0, punto) : archivo.name)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'comprobante'

  const sello = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${base}-${sello}.${extension}`
}

class FormularioPedido extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...CAMPOS_VACIOS,
      archivo: null,
      errorArchivo: null,
      enviando: false,
      paso: null,
      resultado: null,
    }

    // <input type="file"> no admite value, asi que es el unico campo no
    // controlado del formulario. La referencia sirve para limpiarlo.
    this.inputArchivo = createRef()

    this.validador = new SimpleReactValidator({
      locale: 'es',
      // El locale en espanol deja algunos mensajes a medias (por ejemplo,
      // "3 characters" en la regla min), asi que se reescriben los que se usan.
      messages: {
        email: ':attribute no tiene un formato válido.',
        numeric: ':attribute solo puede contener números.',
        min: ':attribute debe tener al menos :min caracteres.',
        max: ':attribute no puede superar los :max caracteres.',
      },
      // La libreria pasa el nombre del campo a minusculas, asi que aqui se
      // devuelve el mensaje con la mayuscula inicial.
      element: (mensaje) => (
        <div className="text-danger small mt-1">
          {mensaje.charAt(0).toUpperCase() + mensaje.slice(1)}
        </div>
      ),
    })

    this.handleChange = this.handleChange.bind(this)
    this.handleArchivo = this.handleArchivo.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.mostrarMensajeDe = this.mostrarMensajeDe.bind(this)
  }

  // Al salir de un campo se muestra su mensaje. showMessageFor() solo cambia
  // el estado interno del validador, asi que hace falta forzar el repintado.
  mostrarMensajeDe(campo) {
    this.validador.showMessageFor(campo)
    this.forceUpdate()
  }

  // Deja el formulario sin ningun mensaje de validacion visible.
  //
  // hideMessages() solo apaga el indicador global que enciende showMessages().
  // No toca los campos marcados uno a uno con showMessageFor() al perder el
  // foco: esos siguen en la lista interna del validador. Si solo se llamara a
  // hideMessages(), tras un envio exitoso esos campos, ya vacios, mostrarian
  // "obligatorio". Por eso se oculta tambien cada campo individualmente.
  ocultarMensajes() {
    this.validador.hideMessages()
    Object.values(CAMPO).forEach((campo) => this.validador.hideMessageFor(campo))
  }

  // Input controlado: cada tecla actualiza el state del componente.
  handleChange(evento) {
    const { name, value } = evento.target
    this.setState({ [name]: value })
  }

  // El archivo se valida al seleccionarlo, para avisar de inmediato.
  handleArchivo(evento) {
    const archivo = evento.target.files[0] ?? null

    if (!archivo) {
      this.setState({ archivo: null, errorArchivo: null })
      return
    }

    const error = validarArchivo(archivo)
    if (error) {
      this.limpiarArchivo()
      this.setState({ archivo: null, errorArchivo: error })
      return
    }

    this.setState({ archivo, errorArchivo: null })
  }

  limpiarArchivo() {
    if (this.inputArchivo.current) {
      this.inputArchivo.current.value = ''
    }
  }

  // Copia de todo lo que se va a guardar, tomada antes del primer await.
  // La subida del comprobante es asincrona y durante ese rato el componente
  // puede volver a renderizarse; sin esta copia, el pedido podria terminar
  // mezclando el archivo de un envio con datos o carrito modificados despues.
  tomarInstantanea() {
    const productos = this.props.carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
    }))

    return {
      nombre: this.state.nombre,
      email: this.state.email,
      telefono: this.state.telefono,
      direccion: this.state.direccion,
      archivo: this.state.archivo,
      usuario: auth.currentUser,
      productos,
      total: productos.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0,
      ),
    }
  }

  async handleSubmit(evento) {
    evento.preventDefault()

    // Si algun campo no cumple sus reglas, se muestran los mensajes y se corta.
    if (!this.validador.allValid()) {
      this.validador.showMessages()
      this.forceUpdate()
      return
    }

    if (!firebaseConfigurado) {
      this.setState({
        resultado: {
          ok: false,
          texto: 'Falta configurar Firebase: copia .env.example como .env.',
        },
      })
      return
    }

    // A partir de aqui se trabaja solo con la instantanea.
    const datos = this.tomarInstantanea()
    const { archivo, usuario } = datos

    if (datos.productos.length === 0) {
      this.setState({
        resultado: {
          ok: false,
          texto: 'Agrega al menos un producto al carrito antes de enviar.',
        },
      })
      return
    }

    // El comprobante se guarda en la carpeta del usuario, asi que sin sesion
    // no hay donde escribirlo. Se bloquea el envio completo en lugar de
    // descartar el archivo en silencio.
    if (archivo && !usuario) {
      this.setState({
        resultado: {
          ok: false,
          texto:
            'Inicia sesión para adjuntar un comprobante, o quita el archivo para enviar el pedido sin él.',
        },
      })
      return
    }

    // Segunda pasada de validacion, por si el archivo cambio desde que se
    // selecciono.
    if (archivo) {
      const error = validarArchivo(archivo)
      if (error) {
        this.setState({ errorArchivo: error, resultado: null })
        return
      }
    }

    this.setState({ enviando: true, paso: null, resultado: null })

    // Paso 1: subir el comprobante, si lo hay.
    let datosComprobante = null

    if (archivo) {
      this.setState({ paso: 'Subiendo comprobante...' })

      try {
        const ruta = `comprobantes/${usuario.uid}/${nombreUnico(archivo)}`
        await uploadBytes(ref(storage, ruta), archivo, {
          contentType: archivo.type,
        })

        datosComprobante = {
          comprobantePath: ruta,
          comprobanteNombre: archivo.name,
          comprobanteTipo: archivo.type,
        }
      } catch (error) {
        this.setState({
          enviando: false,
          paso: null,
          resultado: {
            ok: false,
            texto: `No se pudo subir el comprobante: ${error.message}`,
          },
        })
        return
      }
    }

    // Paso 2: guardar el pedido.
    this.setState({ paso: 'Guardando pedido...' })

    try {
      const pedido = {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        direccion: datos.direccion,
        productos: datos.productos,
        total: datos.total,
        fecha: serverTimestamp(),
      }

      // Si hay sesion iniciada se deja registrado quien hizo el pedido.
      // Sin sesion el pedido se guarda igual: el Ejercicio 2 no depende
      // del Ejercicio 3.
      if (usuario) {
        pedido.uid = usuario.uid
        pedido.correoUsuario = usuario.email
      }

      // Solo la ruta y los datos del archivo. No se guarda URL de descarga.
      if (datosComprobante) {
        Object.assign(pedido, datosComprobante)
      }

      const referencia = await addDoc(collection(db, 'pedidos'), pedido)

      this.ocultarMensajes()
      this.limpiarArchivo()
      this.setState({
        ...CAMPOS_VACIOS,
        archivo: null,
        errorArchivo: null,
        enviando: false,
        paso: null,
        resultado: {
          ok: true,
          texto: `Pedido guardado en Firestore con el id ${referencia.id}`,
        },
      })
    } catch (error) {
      // Si el comprobante ya se subio, queda un archivo huerfano en Storage.
      // No se borra: eso exigiria abrir permiso de borrado en las reglas.
      this.setState({
        enviando: false,
        paso: null,
        resultado: {
          ok: false,
          texto: datosComprobante
            ? `El comprobante se subió pero no se pudo guardar el pedido: ${error.message}`
            : `No se pudo guardar el pedido: ${error.message}`,
        },
      })
    }
  }

  render() {
    const {
      nombre,
      email,
      telefono,
      direccion,
      archivo,
      errorArchivo,
      enviando,
      paso,
      resultado,
    } = this.state

    return (
      <section className="mt-5">
        <h2 className="h5 mb-3">Datos del pedido</h2>

        <form onSubmit={this.handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="nombre">
                Nombre
              </label>
              <input
                className="form-control"
                id="nombre"
                name="nombre"
                type="text"
                value={nombre}
                onChange={this.handleChange}
                onBlur={() => this.mostrarMensajeDe(CAMPO.nombre)}
                disabled={enviando}
              />
              {this.validador.message(CAMPO.nombre, nombre, 'required|min:3')}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="form-control"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={this.handleChange}
                onBlur={() => this.mostrarMensajeDe(CAMPO.email)}
                disabled={enviando}
              />
              {this.validador.message(CAMPO.email, email, 'required|email')}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="telefono">
                Teléfono (solo números)
              </label>
              <input
                className="form-control"
                id="telefono"
                name="telefono"
                type="tel"
                value={telefono}
                onChange={this.handleChange}
                onBlur={() => this.mostrarMensajeDe(CAMPO.telefono)}
                disabled={enviando}
              />
              {this.validador.message(
                CAMPO.telefono,
                telefono,
                'required|numeric|min:8,string|max:12,string',
              )}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="direccion">
                Dirección de despacho
              </label>
              <input
                className="form-control"
                id="direccion"
                name="direccion"
                type="text"
                value={direccion}
                onChange={this.handleChange}
                onBlur={() => this.mostrarMensajeDe(CAMPO.direccion)}
                disabled={enviando}
              />
              {this.validador.message(CAMPO.direccion, direccion, 'required|min:5')}
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="comprobante">
                Comprobante (opcional)
              </label>
              <input
                className="form-control"
                id="comprobante"
                name="comprobante"
                type="file"
                ref={this.inputArchivo}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={this.handleArchivo}
                disabled={enviando}
              />
              <div className="form-text">
                JPG, PNG, WEBP o PDF, máximo 5 MB. Requiere sesión iniciada.
              </div>
              {archivo && (
                <div className="text-success small mt-1">
                  Archivo seleccionado: {archivo.name}
                </div>
              )}
              {errorArchivo && (
                <div className="text-danger small mt-1">{errorArchivo}</div>
              )}
            </div>
          </div>

          <button
            className="btn btn-success mt-3"
            type="submit"
            disabled={enviando}
          >
            {enviando ? (paso ?? 'Enviando...') : 'Enviar pedido'}
          </button>
        </form>

        {/* Renderizado condicional del resultado del envio. */}
        {resultado && (
          <div
            className={`alert mt-3 ${resultado.ok ? 'alert-success' : 'alert-danger'}`}
            role="alert"
          >
            {resultado.texto}
          </div>
        )}
      </section>
    )
  }
}

export default FormularioPedido
