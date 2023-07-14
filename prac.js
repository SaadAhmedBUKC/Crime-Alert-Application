const express = require('express');
const app = express();
const path = require('path');
const Prod = require('./models/prod')
const Cop = require('./models/cops');
const passport = require('passport');

app.post('/register', async(req, res) => {
    try{
    const {email, username, password} = req.body;
    const cop = new Cop({email, username});
    const regCop = await Cop.register(cop, password);
    req.login(regCop, err => {
        if(err) return next(err);
        req.flash('success', 'User Registerted');
        res.redirect('/products');
    })
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect('/register')
    }
})
app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}, (req, res) => {
    req.flash('success', 'Access');
    res.redirect('/products')
}))
app.get('/logout', (req, res) => {
    req.logout(function(err){
        if(err) return next(err);
        res.redirect('/home');
    })
})


app.get('/products', async(req, res) => {
    const prod = await Prod.find({});
    res.render('home', {prod})
})

app.get('/products/new', async(req, res) => {
    res.render('new');
})
app.post('/products', async(req, res) => {
    const newProd = new Prod(req.body);
    await newProd.save();
    req.flash('success', 'Product Inserted');
    res.redirect('/products');
})

app.get('/products/:id', async(req, res) => {
    const id = req.params;
    const prod = await Prod.findById(id);
    if(!prod){
        req.flash('error', 'Product does not exist');
        res.redirect('/products');
    }
    res.render('details', {prod});
})

app.delete('/products/:id', async(req, res) => {
    const id = req.params;
    const prod = await Prod.findByIdAndDelete(id);
    res.redirect('/products');
})

app.listen(3000, (req, res) => {
    console.log('at 3000');
})

const mongoose = require('mongoose')
const plm = require('passport-local-mongoose');
const modelSchema = new mongoose.Schema({
    email: {
        type: String
    },
    phone: {
        type: String
    }
})
modelSchema.plugin(plm)
const Model = mongoose.Model('Model', modelSchema);
module.exports=Model;