const driverController = {
  renderDashboard(req, res) {
    res.render('driver/driverDashboard', { user: req.user });
  },
  
  // future driver controllers
};

export default driverController;