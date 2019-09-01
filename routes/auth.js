const { Router } = require('express')
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator')
const crypto = require('crypto')
const sendGrid = require('nodemailer-sendgrid-transport')
const authRouter = Router()
const bcrypt = require('bcryptjs')
const { sendGridKey } = require('../keys/index')
const { User } = require('../models/user')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const { registerValidators } = require('../utils/validators')

const transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key: sendGridKey
    }
}))

authRouter.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    })
})

authRouter.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })
        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password)
            if (isSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) throw err
                    else res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Неверный пароль')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует')
            res.redirect('/auth/login#login')
        }
    } catch (error) {
        console.log(error)
    }
})

authRouter.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, name, password: hashPassword, cart: { items: [] }
        })
        await user.save()
        await transporter.sendMail(regEmail(email))
        res.redirect('/auth/login#login')
    } catch (error) {
        console.log(error)
    }
})

authRouter.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')
    })
})

authRouter.get('/password/:token', async (req, res) => {
    try {
        if (!req.params.token) {
            res.redirect('/auth/login')
            return
        }
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        })
        if (!user) return res.redirect('/auth/login')

        res.render('auth/password', {
            title: 'Востановление пароля',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
        })
    } catch (error) {
        console.log(error)
    }
})

authRouter.post('/reset', (req, res) => {
    try {
        const { email } = req.body
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так')
                res.redirect('/auth/reset')
                return
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

authRouter.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        })
        if (!user) return res.redirect('/auth/login')
        user.password = await bcrypt.hash(req.body.password, 10)
        user.resetToken = undefined
        user.resetTokenExp = undefined
        await user.save()
        res.redirect('/auth/login')
    } catch (error) {
        console.log(error)
    }
})

module.exports = { authRouter }