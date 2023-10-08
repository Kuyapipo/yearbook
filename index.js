const express = require('express');
const passport =require('./config/passport');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const gridfs = require('gridfs-stream');
const Grid = require('gridfs-stream');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');





const app = express();

app.use(cors());

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
        initGridFS();
    })
    .catch(err => console.log(err));

let gfs;

function initGridFS() {
    const conn = mongoose.connection;
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
}



const storage = multer.diskStorage({
    destination: './uploads', // Define your upload destination
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);
            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

const upload = multer({ storage: storage });


//EJS Extenstion
app.use(expressLayouts);
app.set('view engine', 'ejs');


//Bodyparser
app.use(express.urlencoded({extended: false}));

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




const PORT = process.env.PORT||5000;

app.listen(PORT,console.log('Server running on PORT', PORT));