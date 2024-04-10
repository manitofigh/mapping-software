const dashboard = (req, res) => {
  // res.render("admin/dashboard", { title: "Admin Dashboard" });
  res.send("working");
};

const manageUsers = (req, res) => {
  res.render("", { title: "Manage Users" });
};

const systemSettings = (req, res) => {
  res.render("admin/settings", { title: "System Settings" });
};

export default {
  dashboard,
  manageUsers,
  systemSettings,
};
