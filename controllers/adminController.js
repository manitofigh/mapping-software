const adminController = {
  renderDashboard(req, res) {
    res.render('admin/adminDashboard', { user: req.user });
  },
  
  async renderApplications(req, res) {
    try {
      const applications = await DriverModel.findPendingApplications();
      res.render('admin/applications', { applications });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/dashboard');
    }
  },

  async approveApplication(req, res) {
    try {
      const applicationId = req.params.id;
      await DriverModel.updateStatus(applicationId, 'approved');
      const driver = await DriverModel.findById(applicationId);
      await sendEmail(driver.email, 'Application Approved', 'Your driver application has been approved.');
      req.flash('success', 'Application approved successfully');
      res.redirect('/admin/applications');
    } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while approving the application');
      res.redirect('/admin/applications');
    }
  },

  async rejectApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const driver = await DriverModel.findById(applicationId);
      await sendEmail(driver.email, 'Application Rejected', 'Your driver application has been rejected.');
      await DriverModel.delete(driver.email);
      req.flash('success', 'Application rejected successfully');
      res.redirect('/admin/applications');
    } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while rejecting the application');
      res.redirect('/admin/applications');
    }
  },
};

export default adminController;