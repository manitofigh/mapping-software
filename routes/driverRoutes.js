import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("driver/driverDashboard", { user: req.user });
});

//future driver routes

export default router;
