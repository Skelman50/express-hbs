const { Schema, model } = require('mongoose')

const User = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    avatarUrl: String,
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [{
            count: {
                type: Number,
                required: true,
                default: 1
            },
            courseId: {
                type: Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            }
        }]
    }
})

User.methods.addToCart = function (course) {
    const cloneItems = [...this.cart.items]
    const index = cloneItems.findIndex(c => c.courseId.toString() === course._id.toString())
    if (index >= 0) {
        cloneItems[index].count += 1
    } else {
        cloneItems.push({
            courseId: course._id,
            count: 1
        })
    }

    this.cart = { items: cloneItems }
    return this.save()
}

User.methods.removeFromCart = function (id) {
    let items = [...this.cart.items]
    const idx = items.findIndex(c => c.courseId.toString() === id.toString())
    if (items[idx].count === 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    } else {
        items[idx].count -= 1
    }
    this.cart = { items }
    return this.save()
}

User.methods.clearCart = function () {
    this.cart = { items: [] }
    this.save()
}

module.exports = {
    User: model('User', User)
}