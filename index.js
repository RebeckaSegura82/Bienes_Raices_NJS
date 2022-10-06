import express from "express";
import csrf from 'csurf'
import cookieParser from "cookie-parser";
import usuariosRoutes from "./routes/usuarioRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import db from "./config/db.js";

// Crear app
const app = express()

// Habilitar lectura de datos del formulario
app.use( express.urlencoded({ extended: true}))


// Habilitar Cookie Parser
app.use(cookieParser())

// Habilitar CSRF
app.use(csrf({cookie: true}))
// conexión a la BD
try {
    await db.authenticate()
    db.sync()
    console.log('Conexión a la base de datos')
} catch (error) {
    console.log(error)
}

// Habilitar el Pug 
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta publica y archivos estaticos (css js imagenes)
app.use( express.static('public') )

// Crear el Routing
app.use('/', appRoutes)
app.use('/auth', usuariosRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)

// Crear el puerto y el arranque del proyecto 
const port = process.env.PORT || 3000
app.listen(port, ()=> {
    console.log(`el servidor esta funcionando por el puerto ${port}`)
})