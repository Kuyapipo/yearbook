const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedSadmin } = require('../config/auth');
//Superadmin Model
const User = require('../models/User');
//University model
const University=require('../models/University');


router.get('/', (req,res)=> res.render('superadhome'));
//Login Page
router.get('/sadminlogin', (req,res)=>res.render('sadminlogin'));

router.post('/updateuniversitystatus/:universityId', ensureAuthenticatedSadmin, async (req, res) => {
    const universityId = req.params.universityId;
    const newStatus = req.body.changeStatus;

    try {
        console.log('University ID:', universityId);
        console.log('New Status:', newStatus);

        const university = await University.findById(universityId);
        console.log('Found University:', university);
        if (!university) {
            throw new Error("University not found");
        }
        console.log(newStatus);
        university.changeStatus = newStatus;
        console.log('University saved with new status:', university);

        await university.save();
        if (newStatus === 'Remove') {
            await University.findByIdAndRemove(universityId);
            console.log('University removed:', university);
        }
        res.redirect('/superadmin/pagesadmin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/updatestatus/:userId', ensureAuthenticatedSadmin, async (req, res) => {
    const userId = req.params.userId;
    const newStatus = req.body.status;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Update the user's status
        user.status = newStatus;

        // Save the updated user
        await user.save();

        if (newStatus === "Delete") {
            // Delete the user data from the database
            await User.findByIdAndRemove(userId);
        }

        // Redirect back to the original page (e.g., /superadmin/pagesadmin)
        res.redirect('/superadmin/pagesadmin');
    } catch (err) {
        console.error(err);
        // Handle the error (e.g., red  irect to an error page)
        res.status(500).send('Internal Server Error');
    }
});


router.get('/pagesadmin', ensureAuthenticatedSadmin, async (req, res) => {
    try {
        // Fetch user data for University Admin user types
        const universityAdminUserData = await User.find({ userType: 'University Admin' });
        // Fetch all universities from the database
        const universityData = await University.find();

        if (!universityAdminUserData) {
            throw new Error("No University Admin user data found");
        }

        res.render('pagesadmin', {
            allUserData: universityAdminUserData,
            universityData:universityData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//adding university to database handling
router.post('/pagesadmin',ensureAuthenticatedSadmin,(req,res)=>{
    let {university, changeStatus, dateRegistered}=req.body;
    let errors=[];
    if(!university){
        req.flash('error_msg','Please Fill all the fields');
        return res.redirect('/superadmin/pagesadmin');
    }else{
        University.findOne({university:university})//compare if there is existing inputted university
            .then(existingUniversity=>{
                if(existingUniversity){
                    req.flash('error_msg','University already exists!');
                    return res.redirect('/superadmin/pagesadmin');
                }else{
                    const newUniversity = new University({
                        university,
                        changeStatus,
                        dateRegistered: new Date()
                    });
                    newUniversity.save()
                    .then(savedUniversity =>{
                        req.flash('success_msg','Saved University');
                        console.log("Access after adding inputted text");
                        return res.redirect('/superadmin/pagesadmin');
                    })
                    .catch(err => {
                        console.error(err);
                        req.flash('error_msg', 'An error occurred while saving the university');
                        res.redirect('/superadmin/pagesadmin');
                    });
                }
                
            })
            .catch(err => {
                console.error(err);
                req.flash('error_msg', 'An error occurred while checking for existing university');
                res.redirect('/superadmin/pagesadmin');
            });
        console.log(req.body);
        
    }
    
});




router.post('/sadminlogin', (req, res, next) => {
    passport.authenticate('super-local', {
        successRedirect: '/superadmin/pagesadmin', // Redirect on successful login
        failureRedirect: '/superadmin/sadminlogin', // Redirect on failed login
        failureFlash: true, // Enable flash messages for errors
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/superadmin/sadminlogin');
    });
});



module.exports=router;