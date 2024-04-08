const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(passport, pool) {
    // Local strategy for authentication using email and password
    passport.use(new LocalStrategy({
        usernameField: 'email', // Using 'email' instead of default 'username'
    }, async (email, password, done) => {
        try {
            // Query the database for a user with the inputed email
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (rows.length > 0) {
                const user = rows[0];

                // Compare the provided password with the stored hash
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user); // Success
                } else {
                    return done(null, false, { message: 'Password incorrect' }); // Password does not match
                }
            } else {
                return done(null, false, { message: 'No user found with that email' }); // No user found
            }
        } catch (error) {
            return done(error); // An error occurred
        }
    }));

    // Serialize user to the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            if (rows.length > 0) {
                done(null, rows[0]); // User found
            }
        } catch (error) {
            done(error, null);
        }
    });
};
