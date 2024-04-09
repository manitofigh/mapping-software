const dashboard = (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
};

const manageUsers = (req, res) => {
  res.render("admin/users", { title: "Manage Users" });
};

const systemSettings = (req, res) => {
  res.render("admin/settings", { title: "System Settings" });
};

export default {
  dashboard,
  manageUsers,
  systemSettings,
};
