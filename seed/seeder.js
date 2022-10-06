import exit from "node:process";
import categorias from "./categorias.js";
import precios from "./precio.js";
import usuarios from "./usuarios.js"
import db from "../config/db.js";
import {Categoria, Precio, Usuario} from '../models/index.js'

const importarDatos = async () => {
    try {
        // Antenticar en la base de datos
        await db.authenticate()

        // Generar las Columnas
        await db.sync()

        // Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])


        console.log('Datos importados correctamente')
        exit()
        
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const eliminarDatos = async () => {
    try {

        //await Promise.all([
            //Categoria.destroy({where: {}, truncate: true}),
            //Precio.destroy({where: {}, truncate: true})
        //]) ** esto es una forma de hacerlo

        await db.sync({force: true})
        console.log('Datos eliminados correctamente')
        exit()

    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i") {
    importarDatos()
}

if(process.argv[2] === "-e") {
    eliminarDatos()
}