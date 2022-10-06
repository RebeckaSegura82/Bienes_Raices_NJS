import express from "express";
import { formularioLogin, autenticar, cerrarSesion, formularioRegistro, registrar, confirmar, olvidePassword, resetPassword, comprobarToken, nuevoPassword } from "../controllers/usuarioController.js";

const router = express.Router()


router.get('/login', formularioLogin)
router.post('/login', autenticar)

// Cerrar Sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)
// Confirmar cuenta de registro
router.get('/confirmar/:token', confirmar)

router.get('/olvide-password', olvidePassword)
router.post('/olvide-password', resetPassword)
// Crear el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)


export default router