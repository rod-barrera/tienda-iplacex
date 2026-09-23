import ListaProductos from './components/ListaProductos.jsx'
import Footer from './components/Footer.jsx'

// ListaProductos se monta una sola vez y es el dueno del carrito.
// Las rutas se resuelven dentro de el (ver ListaProductos.jsx) para que el
// estado del carrito sobreviva a la navegacion entre catalogo y detalle.
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <ListaProductos />
      </main>
      <Footer />
    </div>
  )
}

export default App
