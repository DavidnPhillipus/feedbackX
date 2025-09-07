import express from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { nanoid } from "nanoid";

const router = express.Router();

//create an invite

router.post("/roomId/invite", async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const code = nanoid(10);
  const invite = await prisma.invite.create({
    data: {
      code,
      roomId: parseInt(roomId!),
    },
  });
  res.json({ inviteLink: `localhost:300/invite/${code}` });
});

//Accept an invite
router.post("/accept", async (req: Request, res: Response) => {
  const { code, userId } = req.body;
  const invite = await prisma.invite.findUnique({
    where: { code },
  });
  if (!invite) return res.status(404).json({ error: "Invalid invite" });
  await prisma.roon.update({
    where: { id: invite.roomId },
    data: { members: { connect: { id: userId } } },
  });
  res.json({ succes: true, roomId: invite.roomId });
});
module.exports = router;
