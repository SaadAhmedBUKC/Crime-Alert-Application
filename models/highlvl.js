const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const dgSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
});
dgSchema.plugin(passportLocalMongoose);
const Dg = mongoose.model('Dg', dgSchema);
module.exports = Dg;