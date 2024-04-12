const driverController = {
  renderDashboard(req, res) {
    res.render('driver/driverDashboard.ejs', { user: req.user });
  },
  
  // future driver controllers
};

export default driverController;