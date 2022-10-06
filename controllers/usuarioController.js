import { check, validationResult } from 'express-validator';
import Usuario from "../models/Usuario.js"
import bcrypt from "bcrypt"
import { generarId, generarJWT } from '../helpers/token.js';
import { emailOlvidePassword, emailRegistro } from '../helpers/email.js';

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)
    let resultado = validationResult(req)

    // Vefificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const {email, password} = req.body

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario) {
         // Mostrar error no existe usuario
        return res.render('auth/login',{
            pagina: 'Inicia Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg:'Cuenta no registrada'}]
        })
    }

    // Confirmar que el usuario este confirmado
    if(!usuario.confirmado) {
        // Mostrar error usuario no confirmado
        return res.render('auth/login',{
            pagina: 'Inicia Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg:'Cuenta no confirmada, revisa tu correo para confirmación'}]
        }) 
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)) {
        // Mostrar error usuario no confirmado
        return res.render('auth/login',{
            pagina: 'Inicia Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg:'Password incorrecto'}]
        }) 
    }

    // Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect('/mis-propiedades')
}

// Cerrar Sesión
const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').isLength({min: 6}).withMessage('El password debe de ser minimo de 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('El password debe de ser igual').run(req)
    let resultado = validationResult(req)

    // Vefificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    // Extraer usuario de req.body
    const {nombre, email, password} = req.body
    
    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email : email} })
    
    if(existeUsuario) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario ya existe"}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    // Almacenando el usuario 
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })
    // Enviar email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })
    // Mostrar mensaje de que se creo la cuenta
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un email de confirmación, haz click en el enlance que enviamos a tu email'
    })
}

const confirmar = async (req, res) => {
    const { token } = req.params

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario) {
        // Mostrar error de confirmación
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Hubo un error, la cuenta no está confirmada',
            mensaje: 'El token no es valido',
            error: true
        })
    }

    // Confirmar cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    // Mostrar confirmación de cuenta y enlace a login
    res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'Tu cuenta ha sido confirmada correctamente'
    })

}

const olvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu Password',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    let resultado = validationResult(req)

    // Vefificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const {email} = req.body

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu password',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }

    // Generar Token
    usuario.token = generarId()
    await usuario.save()

    // Enviar un email
    emailOlvidePassword({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Renderizar un mensaje con las instrucciones
    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        mensaje: 'Hemos enviado un email con instrucciones para restablecer tu password'
    })
}

const comprobarToken = async (req, res) => {
    
    const { token } = req.params

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario) {
        // Mostrar error de confirmación
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Hubo un error',
            mensaje: 'El token no es valido',
            error: true
        })
    }

    // Mandarlo al formulario
    res.render('auth/reset-password', {
        pagina: 'Crear Password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    // Validación
    await check('password').isLength({min: 6}).withMessage('El password debe de ser minimo de 6 caracteres').run(req)
    let resultado = validationResult(req)

    // Vefificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Crear Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const {token} = req.params
    const {password} = req.body

    // Identificar que si se el usuario con el token
    const usuario = await Usuario.findOne({where: {token}})

    // Hashear el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)

    // Eliminar el token
    usuario.token = null

    // Guardamos el password y null del token
    await usuario.save()

    // Lo mandas a una vista de existo
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'Password cambiado correctamente'
    })


}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    olvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}