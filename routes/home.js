const { Router } = require('express')

const homeRouter = Router()

homeRouter.get('/', (req, res) => {
    res.render('index', {
        title: 'Главная страница',
        isHome: true
    })
})


module.exports = { homeRouter }