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
passport.use(new localStrategy(Cop.authenticate()));

passport.serializeUser(Cop.serializeUser());
passport.deserializeUser(Cop.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', copRoutes);
app.use('/', dgRoutes);

app.get('/home', async(req, res) => {
    res.render('police/first');
})
app.get('/complains', isLoggedIn, async(req, res) => {
    const complains = await Complain.find({});
    res.render('police/home', {complains});
})
app.post('/getComps', isLoggedIn, async (req, res) => {
    let payload = req.body.payload.trim();
    let search = await Complain.find({location: {$regex: new RegExp('^'+payload+'.*','i')}}).exec();
    res.send({payload: search});
});

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
app.get('/complains/new', isLoggedIn, async(req, res) => {
    res.render('police/new');
})
app.post('/complains', isLoggedIn, upload.array('image', 12), async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const newComplain = new Complain(req.body);
    newComplain.geometry = geoData.body.features[0].geometry;
    newComplain.image = req.files.map((f) => ({url: f.path, filename: f.filename}));
    await newComplain.save();
    req.flash('success', 'Successfully filed a report');
    res.redirect(`/complains/${newComplain._id}`);
})
app.get('/complains/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const complain = await Complain.findById(id);
    if(!complain){
        req.flash('error', 'Cannot find that report!');
        return res.redirect('/complains');
    }
    res.render('police/details', { complain });
})
app.delete('/complains/:id', async (req, res) => {
    const { id } = req.params;
    const deletedComplain = await Complain.findByIdAndDelete(id);
    res.redirect('/complains');
})

app.get('/complainsh/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const complain = await Complain.findById(id);
    if(!complain){
        req.flash('error', 'Cannot find that report!');
        return res.redirect('/complains');
    }
    res.render('police/detailsh', { complain });
})


app.listen(3000, () => {
    console.log('at 3000');
})