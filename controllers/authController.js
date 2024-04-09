import passport from '../config/passport.js';

const getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    // Redirect to a dashboard based on role
    const role = req.user.role;
    if (role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/user/dashboard");
    }
  }
  res.render("login", { title: "Login" }); // Show login page if not authenticated
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/", // Intercepts based on middleware to redirect
    failureRedirect: "/auth/login",
  })(req, res, next);  // Makes sure `req, res, next` are passed to Passport's authenticate method
};

const getRegister = (req, res) => {
  res.render("register", { title: "Register" });
};

const postRegister = (req, res) => {
  // future logic - tdo
  res.redirect("/auth/login");
};

const logout = (req, res) => {
  req.logout();
  res.redirect("/auth/login");
};

const getReset = (req, res) => {
  res.render("reset", { title: "Reset Password" });
};

// const postReset = (req, res) => {
//   // Password reset logic here
//   res.redirect("/auth/login");
// };

export default {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  getReset,
  // postReset,
};
