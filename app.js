if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Complain = require('./models/comp');
const multer = require('multer');
const { storage } = require('./cloudinary')
const upload = multer({ storage })
const session = require('express-session');
const { Cookie } = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const Cop = require('./models/polauth');
const ejsMate = require('ejs-mate');
const copRoutes = require('./routes/cops');
const {isLoggedIn} = require('./middleware');
const {isDgLoggedIn} = require('./mid');
const bodyParser = require('body-parser');
const Dg = require('./models/highlvl');
const dgRoutes = require('./routes/dgs');

mongoose.connect('mongodb://localhost:27017/fyp')
.then(() => {
    console.log("Connection OPEN!!!");
})
.catch(err => console.log(err));

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));

const sessionCofig = {
    secret: 'bettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionCofig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(Dg.authenticate()));

passport.serializeUser(Dg.serializeUser());
passport.deserializeUser(Dg.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', copRoutes);
app.use('/', dgRoutes);

app.get('/home', async(req, res) => {
    res.render('police/firstdg');
})

app.get('/secComps', isDgLoggedIn, async(req, res)=>{
    const date_ob = new Date().toISOString().split('T')[0];
    const complains = await Complain.find({
        created_at: {
        $lt: date_ob
    }
    });
    console.log(date_ob);
    res.render('police/high', {complains});
})
app.get('/complainsh/:id', isDgLoggedIn, async(req, res) => {
    const { id } = req.params;
    const complain = await Complain.findById(id);
    if(!complain){
        req.flash('error', 'Cannot find that report!');
        return res.redirect('/complains');
    }
    res.render('police/detailsh', { complain });
})
app.listen(3000, (req, res) => {
    console.log('3000')
})