const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedUser} = require('../config/auth');
const mongoose = require('mongoose');
const gridfs = require('gridfs-stream');
const Grid = require('gridfs-stream');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

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
//User Model
const User = require('../models/User');
//Home page
router.get('/', (req,res)=> res.render('main'));

//Login Page
router.get('/userlogin', (req,res)=>res.render('userlogin'));
//Registration Page
router.get('/userres', (req,res)=>res.render('userres'));
//Page after log in
router.get('/pageuser', ensureAuthenticatedUser,(req,res)=>
res.render('pageuser',{
    userType: req.user.userType,
    idnumber: req.user.idnumber,
    fullname: req.user.fullname,
    iemail: req.user.iemail,
    schoolType: req.user.schoolType,
    dateOfbirth: req.user.dateOfbirth,
    graduationDate: req.user.graduationDate,
    department: req.user.department,
    courseType: req.user.courseType,
    graduationYear: req.user.graduationYear
    
}));



//Register Handling 
router.post('/userres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,graduationDate,department, courseType, graduationYear}=req.body;
    let errors=[];

    if(userType==='Alumni'){
        //fill form
        if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType|| !dateOfbirth || !graduationDate || !department || !courseType || !graduationYear){
            errors.push({msg:'Please fill all the fields'});
        }
        
    }else{
        //fill form
        if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType||!dateOfbirth || !graduationDate || !department || !courseType||!graduationYear){
            graduationYear='NA';
            errors.push({msg:'Please fill all the fields'});
        }
    }
    if(schoolType === 'nofields'){
        errors.push({msg:'Select a School or University'});
    }
    if(courseType === 'nofields'){
        errors.push({msg:'Select a Course'});
    }
    //Confirmation password match
    if (password !==password2){
        errors.push({msg: 'Password do not match'});
    }
    //password validation length
    if(password.length < 8){
        errors.push({msg:'Password should be atleast 8 characters'});
    }
     console.log(req.body);
   
    if(errors.length > 0 ){
        res.render('userres',{
            errors,
            userType,
            idnumber,
            fullname,
            iemail,
            password,
            password2,
            schoolType,
            dateOfbirth,
            graduationDate,
            department,
            courseType,
            graduationYear
        });
    }else{
        
        //Validation to database
        User.findOne({iemail: iemail})
            .then(user =>{
                if(user){
                    //user exist
                    errors.push({msg:'Email is already registered'});
                    res.render('userres',{
                        errors,
                        userType,
                        idnumber,
                        fullname,
                        iemail,
                        password,
                        password2,
                        schoolType,
                        dateOfbirth,
                        graduationDate,
                        department,
                        courseType,
                        graduationYear
                    });
                }else{
                    const newUser = new User({
                        userType,
                        idnumber,
                        fullname,
                        iemail,
                        password,
                        password2,
                        schoolType,
                        dateOfbirth,
                        graduationDate,
                        department,
                        courseType,
                        graduationYear
                    });
                    
                    //Hash password
                    bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUser.password, salt, (err,hash) =>
                    {
                        if(err) throw(err);
                        //Set password to hash
                        newUser.password = hash;
                        //save user
                        newUser.save()
                        .then(user =>{
                            req.flash('success_msg','You are now registered and can log in');
                            res.redirect('/userlogin');
                        })
                        .catch(err => console.log(err));
                    }))
                }
            });   
    }
    
});

//Login Handle
router.post('/userlogin', (req,res,next)=>{
    passport.authenticate('user-local', {
        successRedirect: '/pageuser', // Redirect on successful login
        failureRedirect: '/userlogin',    // Redirect on failed login
        failureFlash: true,           // Enable flash messages for errors
    })(req,res,next);

});

//Logout handle
router.get('/logout', (req, res, next) => {
    req.logout((err)=>{
        if(err){return next(err);}
        req.flash('success_msg', 'You are logged out');
        res.redirect('/userlogin');
    });
    
});
module.exports = router;