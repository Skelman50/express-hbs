const { Router } = require('express')
const { validationResult } = require('express-validator')
const { Course } = require('../models/course')
const { passport } = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')

const addRouter = Router()

addRouter.get('/', passport, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
})

addRouter.post('/', passport, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    const { title, price, img } = req.body
    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Добавить курс',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title, price, img
            }
        })
    }

    const course = new Course({
        title, price, img,
        userId: req.user
    })
    try {
        await course.save()
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})


module.exports = { addRouter }