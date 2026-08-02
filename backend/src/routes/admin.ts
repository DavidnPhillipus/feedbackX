import express from "express";
import { isAdmin } from "../middleware/auth.js";
import * as adminController from "../controllers/admin.js";
import * as reportsController from "../controllers/reports.js";

const router = express.Router();

router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.listUsers);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/posts", adminController.listPosts);
router.patch("/posts/:id", adminController.updatePost);
router.delete("/posts/:id", adminController.deletePost);

router.get("/reports", reportsController.listReports);
router.patch("/reports/:id", reportsController.updateReport);

export default router;
