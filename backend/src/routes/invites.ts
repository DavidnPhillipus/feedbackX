import express from "express";
import * as invitesController from "../controllers/invites.js";

const router = express.Router();

router.post("/", invitesController.createInvite);
router.post("/accept", invitesController.acceptInvite);
router.post("/decline", invitesController.declineInvite);

export default router;
