import { Link } from 'react-router-dom'

// Componente HIJO del Ejercicio 1.
//
// Es funcional y no tiene estado propio: recibe todo por props.
//   - producto:  los datos que le pasa el padre (PADRE -> HIJO)
//   - onAgregar: el callback que ejecuta al pulsar el boton (HIJO -> PADRE)
//
// Cumple el punto 2 del Ejercicio 1: "Hijo: renderiza producto y boton".
function Producto({ producto, onAgregar }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div className="card h-100 card-producto">
        <img
          src={producto.imagen}
          className="card-img-top"
          alt={producto.nombre}
        />
        <div className="card-body d-flex flex-column">
          <h2 className="h6 card-title">{producto.nombre}</h2>
          <p className="text-success fw-semibold mb-3">
            ${producto.precio.toLocaleString('es-CL')}
          </p>

          <div className="mt-auto d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onAgregar(producto)}
            >
              Agregar al carrito
            </button>
            <Link
              className="btn btn-outline-secondary btn-sm"
              to={`/producto/${producto.id}`}
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Producto
