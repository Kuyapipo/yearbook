module.exports = {
    
    ensureAuthenticatedDean: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this source');
      res.redirect('/deanadmin/deanlogin');
    },
    ensureAuthenticatedUser: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this source');
      res.redirect('/userlogin');
    },
    ensureAuthenticatedSadmin: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this source');
      res.redirect('/superadmin/sadminlogin');
    },
    ensureAuthenticatedUadmin: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this source');
      res.redirect('/uadmin/uadminlogin');
    }

};
