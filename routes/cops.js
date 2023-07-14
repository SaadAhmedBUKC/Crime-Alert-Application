const express = require('express')
const router = express.Router();
const Cop = require('../models/polauth');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', async(req, res) => {
    res.render('police/polUsers/register');
})
router.post('/register', catchAsync(async(req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new Cop({ email, username });
        const registeredCop = await Cop.register(user, password);
        req.login(registeredCop, err => {
            if(err) return next(err);
            req.flash('success', 'Access granted!');
            res.redirect('/complains');
        })
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', async(req, res) => {
    res.render('police/polUsers/login');
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Access granted!');
    res.redirect('/complains')
})

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('home');
})
})

module.exports = router;