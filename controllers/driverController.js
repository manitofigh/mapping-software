const driverController = {
  renderDashboard(req, res) {
    res.render('driver/driverDashboard.ejs', { user: req.user });
  },

  async getOptimizedRoute(req, res) {
    const driverId = req.user.id;
    try {
      const route = await DriverModel.getOptimizedRoute(driverId);
      if (route) {
        res.json(route);
      } else {
        res.render('driver/driverDashboard.ejs', {
          errorTitle: 'No Optimized Route',
          errorBody: 'No optimized route found for the driver.',
        });
      }
    } catch (error) {
      console.error('Error fetching optimized route:', error);
      res.render('driver/driverDashboard.ejs', {
        errorTitle: 'Error Fetching Route',
        errorBody: 'An error occurred while fetching the optimized route. Please try again.',
      });
    }
  },
};

export default driverController;