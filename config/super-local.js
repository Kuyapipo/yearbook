const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//Load Super admin Model
const User = require('../models/User');
module.exports=function(passport){
        passport.use('super-local', new LocalStrategy({ usernameField: 'fullname'}, (fullname, password, done) => {
            // Match Superadmin
            User.findOne({ fullname: fullname })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Account is not registered yet' });
                    }
                    if (user.userType !== 'Super Admin' ) {
                        return done(null, false, { message: 'Invalid Domain User!' });
                    }
                    // Password match
                    if (user.password === password) {
                        return done(null, user);
                      } else {
                        return done(null, false, { message: 'Wrong password' });
                      }
                })
                .catch(err => console.log(err));
    
                console.log('Inside Superadmin Local Strategy');
                console.log('fullname:', fullname);
                console.log('password:', password);
        }));
    
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
    
        passport.deserializeUser((id, done) => {
            User.findById(id)
                .then(user => {
                    if (!user) {
                        return done(new Error('Superadmin not found'), null);
                    }
                    done(null, user);
                })
                .catch(err => {
                    console.error('Mongoose error:', err);
                    done(err, null);
                });
        });
}