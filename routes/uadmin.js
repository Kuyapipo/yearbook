const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedUadmin } = require('../config/auth');

//University Model
const User = require('../models/User');
//Home Page 
router.get('/', (req,res)=> res.render('unverhome'));

//Login Page
router.get('/uadminlogin', (req,res)=>res.render('uadminlogin'));
//Registration Page
router.get('/uadminres', (req,res)=>res.render('uadminres'));

router.get('/pageuadmin',ensureAuthenticatedUadmin,(req, res) => {
    res.render('pageuadmin',{
        userType: req.user.userType,
        idnumber: req.user.idnumber,
        fullname: req.user.fullname,
        iemail: req.user.iemail,
        schoolType: req.user.schoolType,
        dateOfbirth: req.user.dateOfbirth
    });
    
});
//Register Handling 
router.post('/uadminres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,department, courseType,graduationDate,graduationYear,fileDocu,status}=req.body;
    let errors=[];

    userType='University Admin';
    graduationDate='000';
    graduationYear='000';
    fileDocu='NA';
    department='NA';
    courseType='NA';
    status ='Pending';
    if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType|| !dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!status){
            
        errors.push({msg:'Please fill all the fields'});
    }

    if(schoolType === 'nofields'){
        errors.push({msg:'Select a School or University'});
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
        return res.render('uadminres',{
            errors,
            userType,
            idnumber,
            fullname,
            iemail,
            password,
            password2,
            schoolType,
            dateOfbirth,
            department,
            courseType,
            graduationDate,
            graduationYear,
            fileDocu,
            status
        });
    }else{
        //Validation to database
        User.findOne({iemail: iemail})
            .then(user =>{
                if(user){
                    //user exist
                    errors.push({msg:'Email is already registered'});
                    res.render('uadminres',{
                        errors,
                        userType,
                        idnumber,
                        fullname,
                        iemail,
                        password,
                        password2,
                        schoolType,
                        dateOfbirth,
                        department,
                        courseType,
                        graduationDate,
                        graduationYear,
                        fileDocu,
                        status
                    });
                }else{
                    const newUniversity = new User({
                        userType,
                        idnumber,
                        fullname,
                        iemail,
                        password,
                        password2,
                        schoolType,
                        dateOfbirth,
                        department,
                        courseType,
                        graduationDate,
                        graduationYear,
                        fileDocu,
                        status
                    });
                    
                    //Hash password
                    bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUniversity.password, salt, (err,hash) =>
                    {
                        if(err) throw(err);
                        //Set password to hash
                        newUniversity.password = hash;
                        //save user
                        newUniversity.save()
                        .then(user =>{
                            req.flash('success_msg','You are now registered and but your account is under approval currently your account is on Pending Status');
                            res.redirect('/uadmin/uadminlogin');
                        })
                        .catch(err => console.log(err));
                    }))
                }
            });
            req.flash('success_msg','You are now registered and but your account is under approval currently your account is on Pending Status');
            return res.redirect('/uadmin/uadminlogin');
    }
});
router.post('/uadminlogin', (req, res, next) => {
    passport.authenticate('university-local', {
        successRedirect: '/uadmin/pageuadmin', // Redirect on successful login
        failureRedirect: '/uadmin/uadminlogin', // Redirect on failed login
        failureFlash: true, // Enable flash messages for errors
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/uadmin/uadminlogin');
    });
});

module.exports=router;