const adminController = {
  renderDashboard(req, res) {
    res.render('admin/adminDashboard', { user: req.user });
  },
  
  // rest of the future controllers
};

export default adminController;