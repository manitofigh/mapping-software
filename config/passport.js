import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
// import adminModel from '../models/adminModel.js';

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await userModel.findByEmail(email);
        if (user) {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } else {
          return done(null, false, {
            message: "No user found with that email address.",
          });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found."), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
