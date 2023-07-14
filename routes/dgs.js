const express = require('express')
const router = express.Router();
const Dg = require('../models/highlvl');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/dgreg', async(req, res) => {
    res.render('police/polUsers/dgregister');
});
router.post('/dgreg', catchAsync(async(req, res) => {
    try{
        const { email, username, password } = req.body;
        const dg = new Dg({ email, username });
        const registeredDg = await Dg.register(dg, password);
        req.login(registeredDg, err => {
            if(err) return next(err);
            req.flash('success', 'Access granted!');
            res.redirect('/secComps');
        })
    }catch(e){
        req.flash('error', e.message);
        res.redirect('dgreg');
    }
}));

router.get('/dglog', async(req, res) => {
    res.render('police/polUsers/dglogin');
});
router.post('/dglog', passport.authenticate('local', { failureFlash: true, failureRedirect: '/dglog'}), (req, res) => {
    req.flash('success', 'Access granted!');
    res.redirect('/secComps')
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('home');
})});

module.exports = router;