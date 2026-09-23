// Componente ESTATICO. Cobertura preventiva: "componentes (funcionales, de
// clase, dinamicos, estaticos)" figura en los contenidos asociados del examen,
// pero ningun ejercicio exige un componente estatico.
// No depende de props ni de state: siempre renderiza lo mismo.
function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-3 mt-4">
      <div className="container small">
        Tienda Iplacex &middot; Programación de Componentes &middot; Iplacex
      </div>
    </footer>
  )
}

export default Footer
