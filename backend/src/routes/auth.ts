import { Router } from "express";
import * as authController from "../controllers/auth.js";
import * as validation from "../middleware/validation.js";
import authenticated from "../middleware/auth.js";

const router = Router();

router.post("/login", validation.login, authController.login);
router.post("/register", validation.createUser, authController.register);
router.post("/google", validation.googleAuth, authController.googleAuth);
router.get("/me", authenticated, authController.me);

export default router;
