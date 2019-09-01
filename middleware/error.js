const errorMdw = (req, res, next) => {
    res.status(404).render('404', {
        title: 'not found'
    })
}

module.exports = {
    errorMdw
}