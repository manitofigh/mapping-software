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

const postLogin = passport.authenticate("local", {
  successRedirect: "/", // This will be intercepted by the middleware to redirect based on role
  failureRedirect: "/auth/login",
  failureFlash: true, // Optional: for displaying error messages
});

// Other authController functions remain unchanged
