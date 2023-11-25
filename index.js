const express = require('express');
const passport =require('./config/passport');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride= require('method-override');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(cors());
app.use(express.static('./public'));

//Pictures files
app.use('/pictures', express.static(__dirname + '/pictures'));

//passport config

//DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {   
        console.log('MongoDB Connected...');
    })
    .catch(err => console.log('MongoDB Connection Error:', err));


//EJS Extenstion
app.use(expressLayouts);
app.set('view engine', 'ejs');


//Bodyparser
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//Express session 
app.use(session({
    secret: 'strong-secret-key',
    resave: true,
    saveUninitialized: true
  }));


//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//connect-flash
app.use(flash());

//Global Variables
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//routes
app.use('/',require('./routes/mainin'));
app.use('/deanadmin', require('./routes/deanadmin'));
app.use('/superadmin', require('./routes/superadmin'));
app.use('/uadmin', require('./routes/uadmin'));
app.use('/sampleroutes', require('./routes/sampleroutes'));




const PORT = process.env.PORT;

app.listen(PORT,console.log('Server running on PORT', PORT));