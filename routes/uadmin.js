const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedUadmin } = require('../config/auth');

//Dean Model
const User = require('../models/User');
const UnivBackG =require('../models/UnivBackG')
const AddD=require('../models/AddD');
const University =require('../models/University');
//Home Page 
router.get('/', (req,res)=> res.render('unverhome'));

//Login Page
router.get('/uadminlogin', (req,res)=>res.render('uadminlogin'));
//Registration Page
router.get('/uadminres', (req,res)=>res.render('uadminres'));


//University background
router.post('/pageuadmin', ensureAuthenticatedUadmin, async (req, res) => {
    let { UnivAddTitle, UnivEst, UBackground, addressB} = req.body;

    try {
        const univbackgId = req.body.univbackgId;
        if(!UnivAddTitle||!UnivEst||!UBackground||!addressB){
            req.flash('error_msg', 'Please fill all the details');
            return res.redirect('/uadmin/pageuadmin');
        }
        
        // Check if a document with the same UnivAddTitle exists
        const existingUnivBackG = await UnivBackG.findOne({ UnivAddTitle });
        if (existingUnivBackG) {
            // Update the existing document
            const updatedUnivBackG = {
                UnivEst,
                UBackground,
                addressB
            };

            await UnivBackG.findByIdAndUpdate(existingUnivBackG._id, updatedUnivBackG);
            req.flash('success_msg', 'University Background Updated!');
        } else {
            // Create a new document
            const newUnivBackG = new UnivBackG({
                UnivAddTitle,
                UnivEst,
                addressB,
                UBackground
            });

            await newUnivBackG.save();
            req.flash('success_msg', 'University Background Inputted!');
        }

        return res.redirect('/uadmin/pageuadmin');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred while saving data.');
        return res.redirect('/uadmin/pageuadmin');
    }
});

router.get('/pageuadmin',ensureAuthenticatedUadmin, async(req, res) => {

    try {
        // Fetch user data for Dean Admin user types
        const DeanAdminUserData = await User.find({ userType: 'Dean' });
        const UniversityBackData = await UnivBackG.find({ UnivAddTitle: req.user.schoolType });
        const departmentData = await AddD.find();
        

        if (!DeanAdminUserData) {
            throw new Error("No Dean Admin user data found");
        }

        res.render('pageuadmin', {
            departmentData:departmentData,
            uBackgroundData:UniversityBackData,
            allUserData: DeanAdminUserData,
            userType: req.user.userType,
            idnumber: req.user.idnumber,
            fullname: req.user.fullname,
            iemail: req.user.iemail,
            schoolType: req.user.schoolType,
            dateOfbirth: req.user.dateOfbirth,
            addressInput:req.user.addressInput,
            password: req.user.password,
            _id:req.user._id
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/updatedepartmentstatus/:adddId', ensureAuthenticatedUadmin, async (req, res) => {
    const adddId = req.params.adddId;
    const newStatus = req.body.changeStatusD;
    const userStatus = req.body.status;
    try {
        console.log('Department ID:', adddId);
        console.log('New Status:', newStatus);

        const addDepartment = await AddD.findById(adddId);
        console.log('Found Department:', addDepartment);
        if (!addDepartment) {
            throw new Error("Department not found");
        }
        console.log(newStatus);
        addDepartment.changeStatusD = newStatus;
        console.log('Deparment saved with new status:', addDepartment);
        if (newStatus === "Active") {
            await addDepartment.save();
            req.flash('success_msg','Department Registered');
            return res.redirect('/uadmin/pageuadmin');
        }
        if (newStatus === 'Remove') {
            await  AddD.findByIdAndRemove(adddId);
            req.flash('success_msg','Department Remove');
            return res.redirect('/uadmin/pageuadmin');
        }
        return res.redirect('/uadmin/pageuadmin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/updatestatus/:userId', ensureAuthenticatedUadmin, async (req, res) => {
    const userId = req.params.userId;
    //const universityId = req.params.universityId;
    const newStatus = req.body.status;
    const changeStatusD = req.body.changeStatusD; 
    
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
            if(user.department){
                const addDepartment = user.department;
                const existingDepartment =  await AddD.findOne({addDUniversity: user.schoolType, addDepartment});
                if(existingDepartment){
                    req.flash('success_msg', 'Dean admin is Active but the Department Name already exist');
                    return res.redirect('/uadmin/pageuadmin');
                }else{
                    const newAddD = new AddD({
                        addDUniversity: user.schoolType,
                        addDepartment:user.department,
                        changeStatusD,
                        dateDRegistered: new Date(),
                    });

                    await newAddD.save();
                    req.flash('success_msg', 'Department name added but on Pending status');
                    return res.redirect('/uadmin/pageuadmin');
                }
                
            }
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

//Changing Name and Password Updadte
router.post('/updateName/:id',ensureAuthenticatedUadmin, async (req,res)=>{
    let{newfullname}=req.body;
    const existingfullname=req.user.fullname;
    const userId = req.user._id;

    const user = await User.findById(userId);
    try{
        if(newfullname===existingfullname){
            console.log('Name Already ExistL', req.body);
            req.flash('error_msg','Name currently exist!');
            return res.redirect('/uadmin/pageuadmin');
        }
        else{
    
            user.fullname = newfullname
            
            await user.save();
            console.log('Proceed to saving',req.user.fullname);
            req.flash('success_msg','Name successfully updated!');
            return res.redirect('/uadmin/pageuadmin');
        }
        
    }catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
    
});
//Changing Name and Password Updadte
router.post('/updatePassword/:id',ensureAuthenticatedUadmin, async (req,res)=>{
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
                return res.redirect('/uadmin/pageuadmin');
            }
            if(newPass!==newPass2){
                req.flash('error_msg','Password did not match!');
                return res.redirect('/uadmin/pageuadmin');
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
                          res.redirect('/uadmin/uadminlogin');
                        })
                        .catch(err => console.log(err));
                  
                      console.log('Proceed to Password', user.password);
                      console.log('Proceed to Password2', user.password2);
                      req.flash('success_msg', 'Password successfully updated!');
                      return res.redirect('/uadmin/pageuadmin');
                    });
                  });
            }
        }else{
            req.flash('error_msg','Current Password Incorrect');
            return res.redirect('/uadmin/pageuadmin');
        }
        
    }catch (err) {
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