const variables = (req, res, next) => {
    try {
        res.locals.isAuth = req.session.isAuthenticated
        res.locals.csurf = req.csrfToken()
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = { variables }