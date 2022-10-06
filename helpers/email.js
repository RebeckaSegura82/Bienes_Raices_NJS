import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const {nombre, email, token} = datos

      // Enviar email
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
          <p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com</p>
          <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enclace:
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

          <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
      })
}

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const {nombre, email, token} = datos

    // Enviar email
    await transport.sendMail({
      from: 'BienesRaices.com',
      to: email,
      subject: 'Restablece tu password',
      text: 'Restablece tu password',
      html: `
        <p>Hola ${nombre}, Restablece tu password de tu cuenta en bienesRaices.com</p>
        <p>Para restablecer tu cuenta necesitas crear un nuevo password en el siguiente enclace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Crear Nuevo Password</a></p>

        <p>Si tu no creaste esta acción, puedes ignorar el mensaje</p>
      `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}