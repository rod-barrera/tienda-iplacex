import { useParams, Link } from 'react-router-dom'

import productos from '../data/productos.js'

// Ruta CON parametros (/producto/:id). Cobertura preventiva, no requisito literal.
// El id se lee con useParams(), que es el equivalente actual al match.params.id
// que muestra ME2 (react-router v5).
//
// Se renderiza dentro de ListaProductos, que ya aporta el contenedor.
function DetalleProducto() {
  const { id } = useParams()
  const producto = productos.find((p) => p.id === Number(id))

  if (!producto) {
    return (
      <div className="py-3">
        <p className="text-secondary">No existe un producto con el id {id}.</p>
        <Link to="/">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="row g-4 align-items-start py-3">
      <div className="col-12 col-md-5">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="img-fluid rounded border"
        />
      </div>
      <div className="col-12 col-md-7">
        <h2 className="h4">{producto.nombre}</h2>
        <p className="fs-5 text-success fw-semibold">
          ${producto.precio.toLocaleString('es-CL')}
        </p>
        <p>{producto.descripcion}</p>
        <Link className="btn btn-outline-secondary btn-sm" to="/">
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}

export default DetalleProducto
