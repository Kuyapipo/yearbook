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
const Hire = require('../models/Hire');
const UnivBackG =require('../models/UnivBackG')
const SurveyResponse = require('../models/SurveyResponse'); // Replace with your actual model
//User Model
const User = require('../models/User');
//Home page
router.get('/', async (req,res)=> {
    try{
        // Fetch user data for Faculty Admin user types
        const HireData = await Hire.find();
        const UniversityBack = await UnivBackG.find();
        res.render('main',{
            HireData:HireData,
            UniversityBack:UniversityBack,
        });
    }catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/survey-Forms', async (req, res) => {
    try {
        // Extract data from the form submission
        const { surveyName, surveyAge, surveyGender, surveyFeedback, surveyComments } = req.body;
        let errors=[];
        // Create a new SurveyResponse document (replace with your actual model)
        if(!surveyName||!surveyAge||!surveyGender||!surveyFeedback||!surveyComments){
            req.flash('error_msg','Please fill all the survey fields');
        }else{
            const newSurveyResponse = new SurveyResponse({
                surveyName,
                surveyAge,
                surveyGender,
                surveyFeedback,
                surveyComments,
            });
    
            // Save the survey response to the database
            await newSurveyResponse.save();
            req.flash('success_msg','Thank you for answering the survey!');
        }
        // Redirect or render a response page
        console.log(req.body);
        res.redirect('/'); // You can replace '/thank-you' with the path of your thank-you page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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
    graduationYear: req.user.graduationYear,
    _id:req.user._id
    
}));

router.post('/updateName/:id', async (req,res)=>{
    let{newfullname}=req.body;
    const existingfullname=req.user.fullname;
    const userId = req.user._id;

    const user = await User.findById(userId);
    try{
        if(newfullname===existingfullname){
            console.log('Name Already ExistL', req.body);
            req.flash('error_msg','Name currently exist!');
        }
        else{
            user.fullname = newfullname
            await user.save();
            console.log('Proceed to saving',req.user.fullname);
            req.flash('success_msg','Name successfully updated!');

        }
        res.redirect('/pageuser');
    }catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
    
});
//Change password
router.post('/updatePassword/:id', async (req,res)=>{
    let{currPass,newPass,newPass2}=req.body;
    const existingpassword=req.user.password2;
    const userId = req.user._id;

    try{
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }
        if(currPass === existingpassword){
            console.log('Current Password Validated!');
            if(currPass === newPass){
                req.flash('error_msg','New password is the same with current');
                
            }
            if(newPass!==newPass2){
                req.flash('error_msg','Password did not match!');
                
            }else{
                user.password = newPass;
                user.password2 = newPass2;
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                      if (err) throw err;
                      // Set password to the hashed value
                      user.password = hash;
                      // Save the user
                      user.save()
                        .then(user => {
                          req.flash('success_msg', 'Password successfully updated!');
                          
                        })
                        .catch(err => console.log(err));
                  
                      console.log('Proceed to Password', user.password);
                      console.log('Proceed to Password2', user.password2);
                      req.flash('success_msg', 'Password successfully updated!');
                      
                    });
                  });
            }
        }else{
            req.flash('error_msg','Current Password Incorrect');
            
        }
        res.redirect('/pageuser');
    }catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
    
});

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
        graduationYear='000';
        if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType||!dateOfbirth || !graduationDate || !department || !courseType||!graduationYear){
            
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
                            req.flash('success_msg','You are now registered and but your account is under approval currently your account is on Pending Status');
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