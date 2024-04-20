import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import driverController from "../controllers/driverController.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, driverController.renderDashboard);

export default router;
