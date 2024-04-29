import AddressModel from "../models/AddressModel.js";

const driverController = {
  async renderDashboard(req, res) {
    //console.log(req.user.email);
    try{
      res.render('driver/driverDashboard.ejs', 
      { user: req.user,
        geometry: await AddressModel.getRouteGeometriesByEmail(req.user.email),
        mapPinpoints: await AddressModel.getAssignedDeliveryLocationsByEmail(req.user.email)
      });
    } catch (err){
      res.render('driver/driverDashboard.ejs', 
      { user: req.user,
        geometry: null,
        mapPinpoints:null
      });
    }

  },

  /*async getGeometry(req,res) {
    const driverEmail = req.user.email;
    try {
      const geometries = await AddressModel.getRouteGeometriesByEmail(driverEmail);

    } catch (error){
      console.error('Unable to fetching geometries:', error);
      res.render('driver/driverDashboard.ejs', {
        errorTitle: 'Error Fetching Geometries',
        errorBody: 'An error occurred while attempting to fetch the map\'s graph. Please try again.',
      });
    }
  },*/

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
  }
};

export default driverController;