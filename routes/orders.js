const { Router } = require('express')
const Order = require('../models/order')
const { passport } = require('../middleware/auth')
const orderRouter = Router()

orderRouter.get('/', passport, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id
        }).populate('user.userId')

        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map(o => (
                {
                    ...o._doc,
                    price: o.courses.reduce((total, c) => total += c.count * c.course.price, 0)
                }
            ))
        })
    } catch (error) {
        console.log(error)
    }
})

orderRouter.post('/', passport, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate()

        const courses = user.cart.items.map(item => (
            {
                count: item.count,
                course: { ...item.courseId._doc }
            }
        ))

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            courses
        })

        await order.save()
        await req.user.clearCart()
        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
})


module.exports = { orderRouter }