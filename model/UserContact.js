const mongoose = require('mongoose');

const UserContactSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    message: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
});


UserContactSchema.pre('save' ,(next) => {
    if (this.email) {
        this.email = this.email.toLowerCase();
    }
    next();
});


module.exports = mongoose.model('UserContact' , UserContactSchema);