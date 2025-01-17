const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        select: false  // password will not be sent in response by default
    }
});

module.exports = mongoose.model('user', userSchema);