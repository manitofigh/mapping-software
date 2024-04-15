import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        let user = await DriverModel.findDriverByEmail(email);
        if (!user) {
          user = await AdminModel.findAdminByEmail(email);
        }

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (user.status !== 'approved') {
          return done(null, false, { message: 'Your account is pending approval' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await DriverModel.findById(id);
    if (!user) {
      user = await AdminModel.findById(id);
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;