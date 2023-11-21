const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticatedDean} = require('../config/auth');
//University model
const University=require('../models/University');
const AddF = require('../models/AddF');
const AddD = require('../models/AddD');
//Dean Model
const User = require('../models/User');
const Hire = require('../models/Hire');
//Home Page 
router.get('/', (req, res) => res.render('deanhome'));
//Login Page
router.get('/deanlogin', (req, res) => res.render('deanlogin'));
router.get('/pagedean',ensureAuthenticatedDean, async(req, res) => {
    try{
        // Fetch user data for Faculty Admin user types
        const FacultyAdminUserData = await User.find({ userType: 'Faculty' });
        const facultyData = await AddF.find();
        const HireData = await Hire.find();
        if (!FacultyAdminUserData) {
            throw new Error("No Dean Admin user data found");
        }
        res.render('pagedean',{
            allUserData: FacultyAdminUserData,
            facultyData:facultyData,
            HireData:HireData,
            userType: req.user.userType,
            idnumber: req.user.idnumber,
            fullname: req.user.fullname,
            iemail: req.user.iemail,
            schoolType: req.user.schoolType,
            dateOfbirth: req.user.dateOfbirth,
            graduationDate: req.user.graduationDate,
            department: req.user.department,
            courseType: req.user.courseType,
            _id:req.user._id
        });
    }catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
//hiring company
router.post('/pagedean', ensureAuthenticatedDean, async (req, res) => {
    let { companyName, jobTitle, jobDescription, jobRequirements, applicationInstructions,contactName,contactEmail,contactNumber} = req.body;

    try {
        if(!companyName||!jobTitle||!jobDescription||!jobRequirements||!applicationInstructions||!contactName||!contactEmail||!contactNumber){
            req.flash('error_msg', 'Please fill all the details');
            return res.redirect('/deanadmin/pagedean');
        }else {
            // Create a new document
            const newHire = new Hire({
                companyName,
                jobTitle,
                jobDescription,
                jobRequirements,
                applicationInstructions,
                contactName,
                contactEmail,
                contactNumber
            });
            console.log(req.body);
            await newHire.save();
            req.flash('success_msg', 'Hiring Job Company Posted!');
        }

        return res.redirect('/deanadmin/pagedean');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred while saving data.');
        return res.redirect('/deanadmin/pagedean');
    }
});
//Registration Page
router.get('/deanres', async (req, res) => {
    try {
        const universityData = await University.find({ changeStatus: { $ne: 'Pending' } }, 'addUniversity');
        if (!universityData || universityData.length === 0) {
            // Handle the case when no data is found
            return res.status(404).send('No universities found');
        }
        res.render('deanres', {
            universityData: universityData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
});
router.post('/updatehirestatus/:hireId', ensureAuthenticatedDean, async (req,res)=>{
    const hireId = req.params.hireId;
    const newStatus = req.body.changeStatusH;

    try{
        const addHire = await Hire.findById(hireId);
        console.log('Found Hire Posting:', addHire);
        if (!addHire) {
            throw new Error("Hire Posting not found");
        }
        console.log(newStatus);
        addHire.changeStatusH = newStatus;
        console.log('Deparment saved with new status:', addHire);
        if (newStatus === 'Remove') {
            await  Hire.findByIdAndRemove(addHire);
            req.flash('success_msg','Data Remove');
            return res.redirect('/deanadmin/pagedean');
        }
    }catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    
})
router.post('/updatefacultystatus/:addfId', ensureAuthenticatedDean, async (req, res) => {
    const addfId = req.params.addfId;
    const newStatus = req.body.changeStatusF;
    const userStatus = req.body.status;
    try {
        console.log('Department ID:', addfId);
        console.log('New Status:', newStatus);
    
        const addFaculty = await AddF.findById(addfId);
        console.log('Found Department:', addFaculty );
    
        if (!addFaculty) {
            throw new Error("Department not found");
        }
    
        console.log('Previous Status:', addFaculty.changeStatusD);
    
        // Trim and convert to lowercase for case-insensitive comparison
        const trimmedNewStatus = newStatus.trim().toLowerCase();
        const trimmedPreviousStatus = addFaculty.changeStatusF.trim().toLowerCase();
    
        if (trimmedNewStatus === trimmedPreviousStatus) {
            console.log('Status is already ' + newStatus);
            req.flash('error_msg', 'Status is already ' + newStatus);
        } else {
            if (newStatus === 'Remove') {
                await AddF.findByIdAndRemove(addfId);
                console.log('Department removed from the database');
                req.flash('success_msg', 'Department removed from the database');
            } else {
                addFaculty.changeStatusF = newStatus;
                await addFaculty.save();
                console.log('Department saved with new status:', addFaculty);
                req.flash('success_msg', 'Department Name ' + newStatus);
            }
        }
    
        return res.redirect('/deanadmin/pagedean');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Internal Server Error');
        res.status(500).send('Internal Server Error');
    }
});
//upddadtes status account of faculty registering
router.post('/updatestatus/:userId', ensureAuthenticatedDean, async (req, res) => {
    const userId = req.params.userId;
    //const universityId = req.params.universityId;
    const newStatus = req.body.status;
    const changeStatusF = req.body.changeStatusF; 
    
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (newStatus === user.status) {
            req.flash('error_msg', 'Status is already ' + newStatus);
            return res.redirect('/deanadmin/pagedean');
        } else if (newStatus === "Active") {
            user.status = newStatus;
            await user.save();
            if(user.courseType){
                const addFaculty = user.courseType;
                const existingFaculty =  await AddF.findOne({addFUniversity:user.schoolType,addFDepartment:user.department,addFaculty});
                if(existingFaculty ){
                    req.flash('success_msg', 'Department Chair admin is Active but the Department Name already exist');
                    return res.redirect('/deanadmin/pagedean');
                }else{
                    const newAddF = new AddF({
                        addFUniversity: user.schoolType,
                        addFaculty: user.courseType,
                        addFDepartment: user.department,
                        changeStatusF,
                        dateFRegistered: new Date(),
                    });                    

                    await newAddF.save();
                    req.flash('success_msg', 'Department name added but on Pending status');
                    return res.redirect('/deanadmin/pagedean');
                }
                
            }
            req.flash('success_msg', 'Department Chair admin status changed to ' + newStatus);
            return res.redirect('/deanadmin/pagedean');
            
            
        } else if (newStatus === "Pending" || newStatus === 'Decline') {
            user.status = newStatus;
            await user.save();
            req.flash('success_msg', 'Department Chair admin status changed to ' + newStatus);
            return res.redirect('/deanadmin/pagedean');
        }
        else if(newStatus === 'Delete'){
           await  User.findByIdAndRemove(userId);
           req.flash('success_msg','Department Chair Admin deleted');
           return res.redirect('/deanadmin/pagedean');
        }
        
        console.log('Status: ',newStatus);
        return res.redirect('/deanadmin/pagedean');
    } catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
});
router.get('/facultyres', async (req, res) => {
    const schoolTypeVal = req.query.schoolTypeVal;
    try {
        const departmentData = await AddD.find();
        const universityData=await University.find();
        res.render('facultyres', {
            departmentData: departmentData,
            universityData:universityData,
            schoolTypeVal
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
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
//update name or change name
router.post('/updateName/:id',ensureAuthenticatedDean, async (req,res)=>{
    let{newfullname}=req.body;
    const existingfullname=req.user.fullname;
    const userId = req.user._id;

    const user = await User.findById(userId);
    try{
        if(newfullname===existingfullname){
            console.log('Name Already ExistL', req.body);
            req.flash('error_msg','Name currently exist!');
            return res.redirect('/deanadmin/pagedean');
        }
        else{
            user.fullname = newfullname
            await user.save();
            console.log('Proceed to saving',req.user.fullname);
            req.flash('success_msg','Name successfully updated!');
            return res.redirect('/deanadmin/pagedean');
        }
        
    }catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
    
});
//Change password
router.post('/updatePassword/:id',ensureAuthenticatedDean, async (req,res)=>{
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
                return res.redirect('/deanadmin/pagedean');
            }
            if(newPass!==newPass2){
                req.flash('error_msg','Password did not match!');
                return res.redirect('/deanadmin/pagedean');
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
                          res.redirect('/deanadmin/deanlogin');
                        })
                        .catch(err => console.log(err));
                  
                      console.log('Proceed to Password', user.password);
                      console.log('Proceed to Password2', user.password2);
                      req.flash('success_msg', 'Password successfully updated!');
                      return res.redirect('/deanadmin/pagedean');
                    });
                  });
            }
        }else{
            req.flash('error_msg','Current Password Incorrect');
            return res.redirect('/deanadmin/pagedean');
        }
        
    }catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
    
});
//Register Handling Dean
router.post('/deanres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,department, courseType,graduationDate,graduationYear,fileDocu,addressInput,status}=req.body;
    let errors=[];

    //fill form
    graduationDate='000';
    graduationYear='000';
    fileDocu='NA';
    courseType='NA';
    if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType||!dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!addressInput){
       
        errors.push({msg:'Please fill all the fields'});
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

//Register Handling Faculty
router.post('/facultyres', (req,res)=>{
    let{userType, idnumber, fullname,iemail,password,password2,schoolType,dateOfbirth,department, courseType,graduationDate,graduationYear,fileDocu,addressInput,status}=req.body;
    let errors=[];
    
    graduationDate='000';
    graduationYear='000';
    fileDocu='NA';
        //fill form
    if(!userType || !idnumber || !fullname || !iemail || !password || !password2 || !schoolType|| !dateOfbirth || !department || !courseType||!graduationDate||!graduationYear||!fileDocu||!addressInput){
            
        errors.push({msg:'Please fill all the fields'});
    }
    if(department === 'nofields'){
        errors.push({msg:'Select a Course'});
     }
     
    if(courseType === 'nofields'){
       errors.push({msg:'Select a Course'});
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
                res.render('facultyres', {
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
                    res.render('facultyres',{
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
                    const newFaculty = new User({
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
                    bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newFaculty.password, salt, (err,hash) =>
                    {
                        if(err) throw(err);
                        //Set password to hash
                        newFaculty.password = hash;
                        //save user
                        newFaculty.save()
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