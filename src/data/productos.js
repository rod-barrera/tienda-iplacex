// Catalogo local de productos.
// Se mantiene como archivo estatico: el examen no pide leer los productos
// desde Firestore, solo guardar ahi los datos del formulario (Ejercicio 2.4).

const productos = [
  {
    id: 1,
    nombre: 'Teclado mecánico RGB',
    precio: 39990,
    imagen: '/img/teclado.svg',
    descripcion: 'Teclado mecánico de 87 teclas con retroiluminación RGB y switches azules.',
  },
  {
    id: 2,
    nombre: 'Mouse inalámbrico',
    precio: 14990,
    imagen: '/img/mouse.svg',
    descripcion: 'Mouse óptico inalámbrico de 1600 DPI con receptor USB de 2.4 GHz.',
  },
  {
    id: 3,
    nombre: 'Audífonos Bluetooth',
    precio: 29990,
    imagen: '/img/audifonos.svg',
    descripcion: 'Audífonos over-ear con cancelación de ruido y 20 horas de autonomía.',
  },
  {
    id: 4,
    nombre: 'Monitor 24 pulgadas',
    precio: 119990,
    imagen: '/img/monitor.svg',
    descripcion: 'Monitor IPS Full HD de 24 pulgadas a 75 Hz con entradas HDMI y VGA.',
  },
  {
    id: 5,
    nombre: 'Webcam HD',
    precio: 19990,
    imagen: '/img/webcam.svg',
    descripcion: 'Cámara web 1080p con micrófono integrado y enfoque automático.',
  },
]

export default productos
