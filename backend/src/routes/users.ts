import express from "express";
import * as usersController from "../controllers/users.js";
import * as validation from "../middleware/validation.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", usersController.getUsers);
router.patch("/", validation.updateUser, usersController.updateUser);
router.delete("/", usersController.deleteUser);

router.get("/:id", usersController.getUser);
router.post("/:id/follow", usersController.followUser);
router.delete("/:id/follow", usersController.unfollowUser);
router.delete("/:id", isAdmin, usersController.adminDeleteUser);
router.get("/:id/following", usersController.getUserFollowing);
router.get("/:id/followers", usersController.getUserFollowers);
router.get("/:id/posts", usersController.getUserPosts);
router.get("/:id/posts-liked", usersController.getUserLikedPosts);
router.get("/:id/posts-followed", usersController.getUserFollowedPosts);
router.get("/:id/invites", usersController.getUserInvites);

export default router;
