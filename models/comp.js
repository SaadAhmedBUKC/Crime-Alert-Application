const mongoose = require('mongoose');

const opts = { toJSON: { virtuals: true },
    timestamps: {
    createdAt: 'created_at',
}
};
const complainSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: [
        {
            url: String,
            filename: String
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    cnic: {
        type: String,
    },
    complain: {
        type: String,
    },
    details: {
        type: String,
    },
    location: {
        type: String,
    },

}, opts)
complainSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/complains/${this._id}">${this.complain}</a><strong>`
});

const Complain = mongoose.model('Complain', complainSchema);

module.exports = Complain;