const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticatedSadmin } = require('../config/auth');
//Superadmin Model
const User = require('../models/User');


router.get('/', (req,res)=> res.render('superadhome'));
//Login Page
router.get('/sadminlogin', (req,res)=>res.render('sadminlogin'));

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
        // Handle the error (e.g., redirect to an error page)
        res.status(500).send('Internal Server Error');
    }
});

router.get('/pagesadmin', ensureAuthenticatedSadmin, async (req, res) => {
    try {
        // Fetch user data for University Admin user types
        const universityAdminUserData = await User.find({ userType: 'University Admin' });

        if (!universityAdminUserData) {
            throw new Error("No University Admin user data found");
        }

        res.render('pagesadmin', {
            allUserData: universityAdminUserData,
        });
    } catch (err) {
        console.error(err);
        // Handle the error (e.g., redirect to an error page)
        res.status(500).send('Internal Server Error');
    }
});
const University=require('../models/University');
//adding university to database handling
router.post('/superadmin/pagesadmin', (req,res) =>{
    const {university}=req.body;
    let errors=[];
    if(!university){
        errors.push({msg:'Please input some University to add!'});
    }
    if(errors.length>0){
        return res.render('pagesadmin',{
            errors,
            university
        });
    }else{
        //Validate to database
        University.findOne({university:university})
            .then(university=>{
                if(university){
                    //university exist
                    errors.push({msg:'University is already registered'});
                    res.render('pagesadmin',{
                        errors,
                        university
                    });
                }else{
                    const newUniversity = new University({
                        university
                    });
                    newUniversity.save()
                    .then(university =>{
                        req.flash('success_msg','University added to the Program');
                        res.redirect('pagesadmin');
                    })
                    .catch(err => console.log(err));
                }
            });
            req.flash('success_msg','University added to the Program');
            res.redirect('pagesadmin');
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