const express = require('express')
const exphnb = require('express-handlebars')
const helmet = require('helmet')
const path = require('path')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const csurf = require('csurf')
const compression = require('compression')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const { addRouter } = require('./routes/add')
const { coursesRouter } = require('./routes/courses')
const { orderRouter } = require('./routes/orders')
const { homeRouter } = require('./routes/home')
const { cardRouter } = require('./routes/card')
const { authRouter } = require('./routes/auth')
const { profileRouter } = require('./routes/profile')
const { variables } = require('./middleware/variables')
const { usermdw } = require('./middleware/user')
const fileLoad = require('./middleware/file')
const { urlDB, secretSession } = require('./keys/index')
const { errorMdw } = require('./middleware/error')

const app = express()

const hbs = exphnb.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({
    collection: 'sessions',
    uri: urlDB
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: secretSession,
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(fileLoad.single('avatar'))

app.use(csurf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(variables)
app.use(usermdw)

app.use('/', homeRouter)
app.use('/add', addRouter)
app.use('/courses', coursesRouter)
app.use('/card', cardRouter)
app.use('/orders', orderRouter)
app.use('/auth', authRouter)
app.use('/profile', profileRouter)

app.use(errorMdw)

const start = async () => {
    try {
        await mongoose.connect(urlDB, {
            useNewUrlParser: true,
            useFindAndModify: false
        })
        app.listen(4004, () => console.log('run'))
    } catch (error) {
        console.log(error)
    }
}

start()

