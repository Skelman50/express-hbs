const { emailFrom, baseURL } = require('../keys/index')

module.exports = (email, token) => {
    return {
        to: email,
        from: emailFrom,
        subject: 'Восстановление доступа',
        html: `
        <h1>Вы забыли пароль?</h1>
        <p>нажмите на ссылку</p>
        <hr>
        <p><a href="${baseURL}/auth/password/${token}">Восстановить</a></p>
        `
    }
}