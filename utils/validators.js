const { body } = require('express-validator')
const { User } = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный  email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('Email занят!')
                }
            } catch (error) {
                console.log(error)
            }
        }).normalizeEmail(),
    body('password', 'Минимальный пароль должен быть 6 символов')
        .isLength({ min: 6 }).isAlphanumeric()
        .trim(),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают')
        } else {
            return true
        }
    })
]


exports.courseValidators = [
    body('title').isLength({ min: 3 }).withMessage('Not valid title length'),
    body('price').isNumeric().withMessage('Price not correct'),
    body('img').isURL().withMessage('not valid Url image')
]