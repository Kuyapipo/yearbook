const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticatedDean} = require('../config/auth');
//University model
const University=require('../models/University');
const AddD = require('../models/AddD');
//Dean Model
const User = require('../models/User');
//Home Page 
router.get('/', (req, res) => res.render('deanhome'));
//Login Page
router.get('/deanlogin', (req, res) => res.render('deanlogin'));
router.get('/pagedean',ensureAuthenticatedDean, (req, res) => {
    res.render('pagedean',{
        userType: req.user.userType,
        idnumber: req.user.idnumber,
        fullname: req.user.fullname,
        iemail: req.user.iemail,
        schoolType: req.user.schoolType,
        dateOfbirth: req.user.dateOfbirth,
        graduationDate: req.user.graduationDate,
        department: req.user.department,
        courseType: req.user.courseType
    });
});
//Registration Page
router.get('/deanres', async (req, res) => {
    try {
        const universityData = await University.find({ changeStatus: { $ne: 'Pending' } }, 'addUniversity');
        const departmentData =await AddD.find({changeStatusD:{$ne: 'Pending'}},'addDepartment');
        if (!universityData || universityData.length === 0) {
            // Handle the case when no data is found
            return res.status(404).send('No universities found');
        }
        if(!departmentData||departmentData.length===0){
            return res.status(404).send('No department found');
        }
        res.render('deanres', {
            universityData: universityData,
            departmentData: departmentData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
});



//Register Handling 
router.post('/deanres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,department, courseType,graduationDate,graduationYear,fileDocu,addressInput,status}=req.body;
    let errors=[];
    if(userType==='Faculty'){
        graduationDate='000';
        graduationYear='000';
        fileDocu='NA';
        //fill form
        if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType|| !dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!addressInput){
            
            errors.push({msg:'Please fill all the fields'});
        }
        if(courseType === 'nofields'){
            errors.push({msg:'Select a Course'});
        }
        
    }else{
        //fill form
        graduationDate='000';
        graduationYear='000';
        fileDocu='NA';
        courseType='NA';
        if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType||!dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!addressInput){
           
            errors.push({msg:'Please fill all the fields'});
        }
    }

    //School/Univeristy
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
        University.find({ changeStatus: { $ne: 'Pending' } }, 'addUniversity')
            .then((universityData) => {
                res.render('deanres', {
                    universityData: universityData,
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
                    status,
                    addressInput
                });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Internal Server Error');
            });

    }else{
        //Validation to database
        User.findOne({iemail: iemail})
            .then(user =>{
                if(user){
                    //user exist
                    errors.push({msg:'Email is already registered'});
                    res.render('deanres',{
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
                        status,
                        addressInput
                    });
                }else{
                    const newDean = new User({
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
                        status,
                        addressInput
                    });
                    
                    //Hash password
                    bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newDean.password, salt, (err,hash) =>
                    {
                        if(err) throw(err);
                        //Set password to hash
                        newDean.password = hash;
                        //save user
                        newDean.save()
                        .then(user =>{
                            req.flash('success_msg','You are now registered and but your account is under approval currently your account is on Pending Status');
                            res.redirect('/deanadmin/deanlogin');
                        })
                        .catch(err => console.log(err));
                    }))
                }
            });
            req.flash('success_msg', 'You are now registered and but your account is under approval currently your account is on Pending Status');
            return res.redirect('/deanadmin/deanlogin');

    }
    
});
router.post('/deanlogin', (req, res, next) => {
    passport.authenticate('dean-local', {
        successRedirect: '/deanadmin/pagedean', // Correct route
        failureRedirect: '/deanadmin/deanlogin',
        failureFlash: true,
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/deanadmin/deanlogin');
    });
});


module.exports=router;