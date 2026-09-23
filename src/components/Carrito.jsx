// Componente HIJO que muestra el contenido del carrito.
//
//   - carrito:  lo que le pasa el padre (PADRE -> HIJO)
//   - onQuitar: callback para avisar al padre que quite un item (HIJO -> PADRE)
//
// El estado no vive aqui: pertenece al padre ListaProductos.
function Carrito({ carrito, onQuitar }) {
  // Renderizado condicional segun si hay articulos o no.
  if (carrito.length === 0) {
    return (
      <section className="mt-5">
        <h2 className="h5">Carrito</h2>
        <p className="text-secondary">Tu carrito está vacío.</p>
      </section>
    )
  }

  const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  )

  return (
    <section className="mt-5">
      <h2 className="h5">Carrito</h2>
      <p className="text-secondary">
        Tienes {unidades} {unidades === 1 ? 'artículo' : 'artículos'} en tu
        carrito.
      </p>

      <ul className="list-group mb-3">
        {carrito.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {item.nombre}{' '}
              <span className="text-secondary">x{item.cantidad}</span>
            </span>
            <span className="d-flex align-items-center gap-3">
              <strong>
                ${(item.precio * item.cantidad).toLocaleString('es-CL')}
              </strong>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onQuitar(item.id)}
              >
                Quitar
              </button>
            </span>
          </li>
        ))}
      </ul>

      <p className="fs-5 mb-0">
        Total: <strong>${total.toLocaleString('es-CL')}</strong>
      </p>
    </section>
  )
}

export default Carrito
