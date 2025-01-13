const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 100
    },
    textBody: {
        type: Object,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 1000
    },
    creationDateTime: {
        type: String,  // Not 'Date' since we want it to be stored automatically in 'ms'
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletionDateTime: {  // Not initialized and not required
        type: Date
    },
    userId: {
        type: Schema.Types.ObjectId,  // The data type of '_id' given by MongoDB
        ref: 'user',  // This is providing a link (like Joins in SQL) to 'users' collection, hence making 'userId' a Foreign Key
        required: true
    }
});

module.exports = mongoose.model('blog', blogSchema);