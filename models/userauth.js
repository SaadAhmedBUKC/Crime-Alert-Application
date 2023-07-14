const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
});

userSchema.plugin(passportLocalMongoose);
const Pupil = mongoose.model('Pupil', userSchema);
module.exports = Pupil;