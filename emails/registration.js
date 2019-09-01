const { emailFrom } = require('../keys/index')

module.exports = (email) => {
    return {
        to: email,
        from: emailFrom,
        subject: 'Регистрация успешна!',
        html: `
        <h1>Добро пожаловать в наш магазин</h1>
        <p>Вы успешно создали аккаунт</p>
        `
    }
}