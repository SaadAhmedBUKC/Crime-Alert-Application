const mongoose = require('mongoose');
const Complain = require('./models/comp');

mongoose.connect('mongodb://localhost:27017/fyp')
.then(() => {
    console.log("Connection OPEN!!!")
})
.catch(err => console.log(err))

const crime = [
    {
        name: 'Saad Ahmed',
        cnic: '42201-123123-123',
        complain: 'Robbery',
        details: '4 people on 2 motorbikes',
        location: 'Bl-7, Gulshan-e-Iqbal'
    },
    {
        name: 'Abdullah Shaikh',
        cnic: '42201-123123-124',
        complain: 'Snatching',
        details: '2 people on 1 motorbike',
        location: 'Bl-7, Gulshan-e-Iqbal'
    }
]
Complain.insertMany(crime)
.then((res)=> {
    console.log(res);
})
.catch((err)=> {
    console.log(err);
})