const { Router } = require('express')
const { validationResult } = require('express-validator')
const { Course } = require('../models/course')
const coursesRouter = Router()
const { passport } = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')

const isOwner = (course, req) => {
    return course.userId.toString() === req.user._id.toString()
}

coursesRouter.get('/', async (req, res) => {
    try {
        const courses = await Course.find({})
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            courses,
            userId: req.user ? req.user._id.toString() : null
        })
    } catch (error) {
        console.log(error)
    }
})

coursesRouter.get('/:id', async (req, res) => {
    try {
        const courseOnce = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            courseOnce
        })
    } catch (error) {
        console.log(error)
    }
})

coursesRouter.get('/:id/edit', passport, async (req, res) => {
    if (!req.query.allow) {
        res.redirect('/')
        return
    }
    try {
        const courseEdit = await Course.findById(req.params.id)
        if (!isOwner(courseEdit, req)) {
            return res.redirect('/courses')
        }
        res.render('course-edit', {
            courseEdit
        })
    } catch (error) {
        console.log(error)
    }
})

coursesRouter.post('/edit', passport, courseValidators, async (req, res) => {
    const { id } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    try {
        delete req.body.id
        const course = await Course.findById(id)
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }
        Object.assign(course, req.body)
        await course.save()
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

coursesRouter.post('/remove', passport, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

module.exports = { coursesRouter }