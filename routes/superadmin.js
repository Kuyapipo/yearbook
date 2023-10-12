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
    const userStatus = req.body.status;
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

        if (newStatus === "Active") {
            await university.save();
            req.flash('success_msg','University Registered');
            return res.redirect('/superadmin/pagesadmin');
        }
        if (newStatus === 'Remove') {
            await University.findByIdAndRemove(universityId);
            console.log('University removed:', university);
            req.flash('success_msg','University Remove');
            return res.redirect('/superadmin/pagesadmin');
        }
        res.redirect('/superadmin/pagesadmin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/updatestatus/:userId', ensureAuthenticatedSadmin, async (req, res) => {
    const userId = req.params.userId;
    //const universityId = req.params.universityId;
    const newStatus = req.body.status;
    const changeStatus = req.body.changeStatus; 
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (newStatus === "Active") {
            // Update the user's status
            user.status = newStatus;
            await user.save();
            if (user.schoolType) {
                // Update the university with the school type
                const university = new University({
                    university: user.schoolType,
                    changeStatus,
                    dateRegistered: new Date(),
                });
                

                // Save the university to the database
                await university.save();
                req.flash('success_msg','University admin is active. Register the University now');
                return res.redirect('/superadmin/pagesadmin');
            }
        }
        if(newStatus === "Pending"){
            user.status = newStatus;
            await user.save();
            req.flash('success_msg','University admin status to ' +newStatus);
            return res.redirect('/superadmin/pagesadmin');
        }
        if(newStatus ==='Decline'){
            user.status = newStatus;
            await user.save();
            req.flash('success_msg','University admin status to ' +newStatus);
            return res.redirect('/superadmin/pagesadmin');
        }
        
        console.log('Status: ',newStatus);
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