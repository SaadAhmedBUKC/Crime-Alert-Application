const mongoose = require('mongoose');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const Pupil = require('../models/userauth');
const catchAsync = require('../utils/catchAsync');

router.get('/register', async(req, res) => {
    res.render('police/users/register');
})
router.post('/register', catchAsync(async(req, res) => {
    try{
    const { email, username, password } = req.body;
    const user = new Pupil({ email, username });
    const regUser = await Pupil.register(user, password);
    req.login(regUser, err => {
        if(err) return next(err);
        req.flash('success', 'Access granted');
        res.redirect('/user'); 
    })}
    catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))

router.get('/login', async(req, res) => {
    res.render('police/users/login');
})
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Access granted!');
    res.redirect('/user');
})

router.get('/logout', (req, res) => {
    req.logout(function(err){
        if(err) return next(err);
        res.redirect('/title');
    })
})

module.exports=router;
