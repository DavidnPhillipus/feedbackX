import express from "express";
import * as reportsController from "../controllers/reports.js";

const router = express.Router();

router.post("/", reportsController.createReport);

export default router;
