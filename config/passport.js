const passport = require('passport');
// Require strategy configuration files
require('./user-local')(passport);
require('./dean-local')(passport);
require('./university-local')(passport);
require('./super-local')(passport);

// Export the initialized passport instance
module.exports = passport;