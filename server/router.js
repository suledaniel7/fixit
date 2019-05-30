const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('client-sessions');

const upload = multer({dest:'public/avatars'});
const reqUpload = multer({dest: 'public/req-photos'});
const engUpload = multer({dest:'public/engAvatars'});

const create = require('../controllers/signup');
const login = require('../controllers/signin');
const profile = require('../controllers/profile');
const createReq = require('../controllers/create-req');
const repReq = require('../controllers/rep-req');
const createEng = require('../controllers/eng-create');
const loginEng = require('../controllers/eng-login');
const engProfile = require('../controllers/eng-profile');
const admLogin = require('../controllers/adm-login');
const admin = require('../controllers/admin');
const processReq = require('../controllers/process-req');
const processEng = require('../controllers/process-eng');
const assignEng = require('../controllers/assign-eng');
const verifyEng = require('../controllers/verify-eng');
const orientation = require('../controllers/orientation');

const userSchema = require('../controllers/schemas/userSchema');
const engSchema = require('../controllers/schemas/engSchema');

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

router.use(session({
    cookieName: 'session',
    duration: 30*60*1000,
    activeDuration: 10*60*1000,
    secret: 'a-zA-Z\\'
}));

router.use(session({
    cookieName: 'engsession',
    duration: 60*60*1000,
    activeDuration: 30*60*1000,
    secret: '\\/jkl;/\\'
}));

router.use(session({
    cookieName: 'admsession',
    duration: 10*60*1000,
    activeDuration: 5*60*1000,
    secret: 'random\\string\\goes// here\s__'
}));

function requireLogin(req, res, next){
    if(!req.session.user){
        res.redirect('/signin');
    }
    else{
        userSchema.findOne({email: req.session.user.email}, function(err, user){
            if(err){
                res.redirect('/signup');
            }
            else if(user === null){
                res.redirect('/signup');
            }
            else if(req.session.user.password !== user.password){
                res.render('signin', { error: "Some info changed since your last signin. Please verify your login details" });
            }
            else {
                next();
            }
        });
    }
}

function requireEngLogin(req, res, next){
    if(!req.engsession.user){
        res.redirect('/engineers/signin');
    }
    else{
        engSchema.findOne({email: req.engsession.user.email}, function(err, user){
            if(err){
                res.redirect('/engineers/signup');
            }
            else if(user === null){
                res.redirect('/engineers/signup');
            }
            else if(req.engsession.user.password !== user.password){
                res.render('eng-login', { error: "Some info changed since your last signin. Please verify your login details" });
            }
            else {
                next();
            }
        });
    }
}

function requireAdmLogin(req, res, next){
    if(!req.admsession.user){
        res.redirect('/admin');
    }
    else if(!req.admsession.user.username){
        res.redirect('/admin');
    }
    else{
        next();
    }
}

router.get('/', function(req, res){
    res.render('home');
});

router.get('/hiw', (req, res)=>{
    res.render('hiw');
});

router.get('/wwd', (req, res)=>{
    res.render('wwd');
})

router.get('/signup', function(req, res){
    res.render('signup');
});

router.post('/signup', upload.single('picture'), create);

router.get('/signin', function(req, res){
    res.render('signin');
});

router.post('/signin', login);

router.get('/profile', requireLogin, profile);

router.get('/repair-request', requireLogin, repReq);

router.post('/rep-req', requireLogin, reqUpload.array('pictures'), createReq);

router.get('/engineers', (req, res)=>{
    res.render('eng-about');
});

router.get('/engineers/signup', (req, res)=>{
    res.render('eng-create');
});

router.post('/engineers/signup', engUpload.single('picture'), createEng);

router.get('/engineers/signin', (req, res)=>{
    res.render('eng-login');
});

router.post('/engineers/signin', loginEng);

router.get('/engineers/orientation', requireEngLogin, orientation);

router.get('/engineers/profile', requireEngLogin, engProfile);

router.get('/admin', (req, res)=>{
    res.render('admin-lgn');
});

router.post('/admin', admLogin);

router.get('/admin/main', requireAdmLogin, admin);

router.get('/admin/process-req/:id', requireAdmLogin, processReq);

router.get('/admin/process-eng/:id', requireAdmLogin, processEng);

router.post('/admin/assign-eng/:id', requireAdmLogin, assignEng);

router.post('/admin/verify-eng/:id', requireAdmLogin, verifyEng);

//rem to partition items repaired into own coll on create acc

module.exports = router;