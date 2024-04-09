const getProfile = (req, res) => {
  res.render("user/profile", { title: "Your Profile", user: req.user });
};

const getSettings = (req, res) => {
  res.render("user/settings", { title: "Settings", user: req.user });
};

export default {
  getProfile,
  getSettings,
};
