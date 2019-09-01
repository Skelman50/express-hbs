const { User } = require('../models/user')

const usermdw = async (req, res, next) => {
    try {
        if (!req.session.user) return next()
        req.user = await User.findById(req.session.user._id)
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = { usermdw }