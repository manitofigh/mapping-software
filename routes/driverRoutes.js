import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import driverController from "../controllers/driverController.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, driverController.renderDashboard);
router.post("/start-trip", isAuthenticated, driverController.startTrip);
router.post("/mark-complete", isAuthenticated, driverController.markComplete);
router.get("/history", isAuthenticated, driverController.renderHistory);

export default router;
