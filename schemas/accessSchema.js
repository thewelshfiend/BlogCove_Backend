const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessSchema = new Schema({
    sessionId: {
        type: String,  // Since, if you see 'sessions' collection, '_id' is a String, not an object
        required: true
    },
    lastRequestTime: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('access', accessSchema);