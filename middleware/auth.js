const passport = (req, res, next) => {
    try {
        if (!req.session.isAuthenticated) {
            res.redirect('/auth/login')
            return
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = { passport }