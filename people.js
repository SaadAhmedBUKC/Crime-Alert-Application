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
const Pupil = require('./models/userauth');
const ejsMate = require('ejs-mate');
const pupilRoutes = require('./routes/pupils');
const {isUserLoggedIn} = require('./peoplemid');
const bodyParser = require('body-parser');
const {isLoggedIn} = require('./middleware');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

mongoose.connect('mongodb://localhost:27017/fyp')
.then(() => {
    console.log("Connection OPEN!!!");
})
.catch(err => console.log(err));

app.engine('ejs', ejsMate);
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

passport.use(new localStrategy(Pupil.authenticate()));
passport.serializeUser(Pupil.serializeUser());
passport.deserializeUser(Pupil.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', pupilRoutes);

app.get('/title', async(req, res) => {
    res.render('police/firstU')
})

app.get('/user', isUserLoggedIn, async(req, res) => {
    const complains = await Complain.find({});
    res.render('police/welU', {complains});
})

app.get('/user/new', isUserLoggedIn, (req, res) => {
    res.render('police/newUser');
})
app.post('/user', isUserLoggedIn, upload.array('image', 12), async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const newComplain = new Complain(req.body);
    newComplain.author = req.user._id;
    newComplain.geometry = geoData.body.features[0].geometry;
    newComplain.image = req.files.map((f) => ({url: f.path, filename: f.filename}));
    await newComplain.save();
    req.flash('success', 'Successfully filed a report');
    res.redirect('/user');
})

app.get('/user/:id', isUserLoggedIn, async(req, res) => {
    const {id} = req.params;
    const complain = await Complain.findById(id);
    if(!complain){
        req.flash('error', 'Cannot find that report!');
        return res.redirect('/user');
    }
    res.render('police/compUser', { complain });
})

app.get('/help', isUserLoggedIn, async(req, res) => {
    res.render('police/quick');
})

app.listen(3000, (req, res) => {
    console.log('at 3000');
})