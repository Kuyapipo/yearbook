const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    const User = require('../models/User');
    passport.use('user-local', new LocalStrategy({ usernameField: 'iemail' }, (iemail, password, done) => {
        // Match user
        User.findOne({ iemail: iemail })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Account is not registered yet' });
                }
                if (user.userType !== 'Alumni' && user.userType !== 'Graduating') {
                    return done(null, false, { message: 'Invalid Domain User!' });
                }
                if(user.status === 'Pending'){

                    return done(null, false, { message: 'Application is on Pending Status! You can check later if its approved and active' });
                }
                if(user.status === 'Decline'){
                    return done(null,false,{message: 'Application is on Decline Status! Registration will be deleted later'});
                }
                // Password match
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Wrong password' });
                    }
                });
            })
            .catch(err => console.log(err));
            console.log('Inside Student Local Strategy');
            console.log('iemail:', iemail);
            console.log('password:', password);
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err);
            });
    });

};