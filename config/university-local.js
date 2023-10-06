const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load University Model
const User = require('../models/User');
module.exports=function(passport){
    //Load University Model
    const User = require('../models/User');
        passport.use('university-local', new LocalStrategy({ usernameField: 'iemail'}, (iemail, password, done) => {
            // Match University
            User.findOne({ iemail: iemail })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Account is not registered yet' });
                    }
                    if (user.userType !== 'University Admin') {
                        return done(null, false, { message: 'Invalid Domain User!' });
                    }
                    if(user.status === 'Pending'){

                        return done(null, false, { message: 'Account is on Pending Status! You can check later if its approved and active' });
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

                console.log('Inside University admin Local Strategy');
                console.log('iemail:', iemail);
                console.log('password:', password);
        }));

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            User.findById(id)
                .then(user => {
                    if (!user) {
                        return done(new Error('University not found'), null);
                    }
                    done(null, user);
                })
                .catch(err => {
                    console.error('Mongoose error:', err);
                    done(err, null);
                });
        });

}