import { Component } from 'react'
import { Routes, Route } from 'react-router-dom'

import productos from '../data/productos.js'
import Producto from './Producto.jsx'
import Carrito from './Carrito.jsx'
import DetalleProducto from './DetalleProducto.jsx'
import Auth from './Auth.jsx'
import FormularioPedido from './FormularioPedido.jsx'

// Componente PADRE del Ejercicio 1.
//
// Es un componente de CLASE porque el examen pide literalmente actualizar el
// carrito con state y this.setState({}) (Ejercicio 1, punto 5).
//
// Las rutas se resuelven aqui dentro y no en App.jsx: asi este componente
// nunca se desmonta al navegar al detalle y el carrito no se pierde.
class ListaProductos extends Component {
  constructor(props) {
    super(props)

    // El estado del carrito vive en el padre.
    this.state = { carrito: [] }

    // Se vinculan los metodos para que `this` apunte al componente cuando el
    // hijo los ejecute como callbacks.
    this.agregarAlCarrito = this.agregarAlCarrito.bind(this)
    this.quitarDelCarrito = this.quitarDelCarrito.bind(this)
  }

  // HIJO -> PADRE: lo llama <Producto /> al pulsar "Agregar al carrito".
  // Si el producto ya estaba, sube la cantidad; si no, lo agrega.
  agregarAlCarrito(producto) {
    this.setState((estadoPrevio) => {
      const yaEsta = estadoPrevio.carrito.some(
        (item) => item.id === producto.id,
      )

      if (yaEsta) {
        return {
          carrito: estadoPrevio.carrito.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        }
      }

      return {
        carrito: [...estadoPrevio.carrito, { ...producto, cantidad: 1 }],
      }
    })
  }

  // HIJO -> PADRE: lo llama <Carrito /> al pulsar "Quitar".
  quitarDelCarrito(id) {
    this.setState((estadoPrevio) => ({
      carrito: estadoPrevio.carrito.filter((item) => item.id !== id),
    }))
  }

  // Catalogo: se muestra en la ruta "/".
  renderCatalogo() {
    return (
      <>
        <p className="text-secondary mb-4">Catálogo de productos</p>

        <div className="row g-4">
          {/* map() recorre el catalogo y genera un hijo por producto.
              La key usa el id, que es unico y estable. */}
          {productos.map((producto) => (
            // PADRE -> HIJO: los datos viajan por props.
            // HIJO -> PADRE: onAgregar es el callback que ejecuta el hijo.
            <Producto
              key={producto.id}
              producto={producto}
              onAgregar={this.agregarAlCarrito}
            />
          ))}
        </div>
      </>
    )
  }

  render() {
    return (
      <div className="container py-4">
        <h1 className="h3 mb-3">Tienda Iplacex</h1>

        {/* Ejercicio 3, punto 2: franja de sesion sobre el catalogo. */}
        <Auth />

        <Routes>
          {/* Ruta SIN parametros */}
          <Route path="/" element={this.renderCatalogo()} />
          {/* Ruta CON parametros */}
          <Route path="/producto/:id" element={<DetalleProducto />} />
        </Routes>

        <Carrito
          carrito={this.state.carrito}
          onQuitar={this.quitarDelCarrito}
        />

        {/* El formulario recibe el carrito por props para guardarlo junto
            con los datos del cliente en Firestore. */}
        <FormularioPedido carrito={this.state.carrito} />
      </div>
    )
  }
}

export default ListaProductos
