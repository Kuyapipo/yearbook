const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedUadmin } = require('../config/auth');

//Dean Model
const User = require('../models/User');
const UnivBackG =require('../models/UnivBackG')
//Home Page 
router.get('/', (req,res)=> res.render('unverhome'));

//Login Page
router.get('/uadminlogin', (req,res)=>res.render('uadminlogin'));
//Registration Page
router.get('/uadminres', (req,res)=>res.render('uadminres'));
//University background
router.post('/pageuadmin', ensureAuthenticatedUadmin ,async (req,res)=>{
    let{UnivAddTitle,UnivEst,UBackground}=req.body;
    if(!UnivAddTitle||!UnivEst||!UBackground){
        req.flash('error_msg', 'Please Fill all the fields before saving...');
        return res.redirect('/uadmin/pageuadmin');
    }else{
        const newUnivBackG = new UnivBackG({
            UnivAddTitle,
            UnivEst,
            UBackground
        });
        newUnivBackG.save()
            .then(uniBackG =>{
                req.flash('success_msg','University Background Inputted!');
                return res.redirect('/uadmin/pageuadmin');
            })
            .catch(err => {
                console.error(err);
                req.flash('error_msg', 'An error occurred while saving data.');
                return res.redirect('/uadmin/pageuadmin');
            });
    }
    
    console.log(req.body);
});
router.get('/pageuadmin',ensureAuthenticatedUadmin, async(req, res) => {

    try {
        // Fetch user data for Dean Admin user types
        const DeanAdminUserData = await User.find({ userType: 'Dean' });
        
        

        if (!DeanAdminUserData) {
            throw new Error("No Dean Admin user data found");
        }

        res.render('pageuadmin', {
            allUserData: DeanAdminUserData,
            userType: req.user.userType,
            idnumber: req.user.idnumber,
            fullname: req.user.fullname,
            iemail: req.user.iemail,
            schoolType: req.user.schoolType,
            dateOfbirth: req.user.dateOfbirth,
            addressInput:req.user.addressInput
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/updatestatus/:userId', ensureAuthenticatedUadmin, async (req, res) => {
    const userId = req.params.userId;
    //const universityId = req.params.universityId;
    const newStatus = req.body.status;
    
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (newStatus === user.status) {
            req.flash('error_msg', 'Status is already ' + newStatus);
            return res.redirect('/uadmin/pageuadmin');
        } else if (newStatus === "Active") {
            user.status = newStatus;
            await user.save();
            req.flash('success_msg', 'University admin status changed to ' + newStatus);
            return res.redirect('/uadmin/pageuadmin');
            
            
        } else if (newStatus === "Pending" || newStatus === 'Decline') {
            user.status = newStatus;
            await user.save();
            req.flash('success_msg', 'University admin status changed to ' + newStatus);
            return res.redirect('/uadmin/pageuadmin');
        }
        else if(newStatus === 'Delete'){
           await  User.findByIdAndRemove(userId);
           req.flash('success_msg','University Admin deleted');
           return res.redirect('/uadmin/pageuadmin');
        }
        
        console.log('Status: ',newStatus);
        return res.redirect('/uadmin/pageuadmin');
    } catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
});
//Register Handling 
router.post('/uadminres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,department, courseType,graduationDate,graduationYear,fileDocu,status,addressInput}=req.body;
    let errors=[];

    userType='University Admin';
    graduationDate='000';
    graduationYear='000';
    fileDocu='NA';
    department='NA';
    courseType='NA';
    status ='Pending';
    if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType|| !dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!status||!addressInput){
            
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
            status,
            addressInput
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
                        status,
                        addressInput
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
                        status,
                        addressInput
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