const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const polSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
})
polSchema.plugin(passportLocalMongoose);
const Cop = mongoose.model('Cop', polSchema);
module.exports = Cop