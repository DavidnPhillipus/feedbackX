import { express } from "express";
import * as usersController from "../controllers/users.js";
import * as validation from "../middleware/validation.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", usersController.getUsers);

router.get("/:id", usersController.getUser);
router.patch("/", validation.updateUser, usersController.updateUser);
router.delete("/", usersController.deleteUser);
router.delete("/:id", isAdmin, usersController.adminDeleteUser);

router.get("/:id/posts", usersController.getUserPosts);
router.get("/:id/posts-liked", usersController.getUserLikedPosts);
router.get("/:id/posts-followed", usersController.getUserFollowedPosts);

router.get("/:id/invites");

export default router;
