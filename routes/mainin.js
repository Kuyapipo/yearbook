const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedUser} = require('../config/auth');
const mongoose = require('mongoose');

const path = require('path');
//University model
const University=require('../models/University');
const AddD = require('../models/AddD');
const AddF = require('../models/AddF');


//User Model
const User = require('../models/User');
//Home page
router.get('/', (req,res)=> res.render('main'));

//Login Page
router.get('/userlogin', (req,res)=>res.render('userlogin'));
//Registration Page
router.get('/userres', async (req, res) => {
    const schoolTypeVal = req.query.schoolTypeVal;
    try {
        const departmentData = await AddD.find();
        const facultyData = await AddF.find();
        const universityData = await University.find();
        res.render('userres', {
            facultyData: facultyData,
            departmentData: departmentData,
            universityData: universityData, // This is passed to the template
            schoolTypeVal
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/universities', async (req, res) => {
    try {
        const universities = await University.find({ changeStatus: { $ne: 'Pending' } }).select('addUniversity');
        res.json(universities);
    } catch (error) {
       res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fetch-departments', async (req, res) => {
    const schoolTypeVal = req.query.schoolTypeVal;
    console.log('Value:',schoolTypeVal);
    try {
        const departmentData = await AddD.find({ addDUniversity: schoolTypeVal });
        res.json(departmentData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/fetch-courseType', async (req, res) => {
    const courseTypeVal = req.query.courseTypeVal;
     const schoolTypeVal = req.query.schoolTypeVal;
    console.log('ValueCourseType:',courseTypeVal);
    console.log('ValueSchoolType:',schoolTypeVal);
    try {
        const facultyData = await AddF.find({ addFUniversity: schoolTypeVal, addFDepartment:courseTypeVal });
        res.json(facultyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
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