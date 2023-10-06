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