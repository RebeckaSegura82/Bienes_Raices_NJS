import express from 'express'
import { body } from 'express-validator'
import {admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes} from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

const router = express()

router.get('/mis-propiedades', protegerRuta, admin)

router.get('/propiedades/crear', protegerRuta, crear)

router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
    body('precio').isNumeric().withMessage('Selecciona un Precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona el numero de habitaciones'),
    body('wc').isNumeric().withMessage('Selecciona el numero de wc'),
    body('estacionamiento').isNumeric().withMessage('Selecciona el numero de estacionamiento'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', 
    protegerRuta, 
    agregarImagen
)

router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta, 
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)

router.post('/propiedades/editar/:id',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacia')
        .isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
    body('precio').isNumeric().withMessage('Selecciona un Precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona el numero de habitaciones'),
    body('wc').isNumeric().withMessage('Selecciona el numero de wc'),
    body('estacionamiento').isNumeric().withMessage('Selecciona el numero de estacionamiento'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios
)

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
)

// Cambiar estado de la propiedad
router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

// Sección de rutas publicas
router.get('/propiedad/:id', 
    identificarUsuario,
    mostrarPropiedad
)

// Almacenar los mensajes
router.post('/propiedad/:id', 
    identificarUsuario,
    body('mensaje').isLength({min: 10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('/mensajes/:id', 
    protegerRuta,
    verMensajes
)


export default router