const { Router } = require('express')
const cardRouter = Router()
const { Course } = require('../models/course')
const { passport } = require('../middleware/auth')

const mapCartItems = (cart) => {
    return cart.items.map(c => (
        {
            ...c.courseId._doc,
            count: c.count,
            id: c.courseId.id
        }
    )
    )
}

const computePrice = (courses) => {
    return courses.reduce((t, c) => t += c.price * c.count, 0)
}

cardRouter.post('/add', passport, async (req, res) => {
    const courseOnce = await Course.findById(req.body.id)
    await req.user.addToCart(courseOnce)
    res.redirect('/card')
})

cardRouter.get('/', passport, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate()
    const courses = mapCartItems(user.cart)
    res.render('card', {
        title: 'Корзина',
        courses,
        price: computePrice(courses),
        isCard: true
    })
})

cardRouter.delete('/remove/:id', passport, async (req, res) => {
    await req.user.removeFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId').execPopulate()
    const courses = mapCartItems(user.cart)

    const cart = {
        courses,
        price: computePrice(courses)
    }
    res.json(cart)
})

module.exports = { cardRouter }