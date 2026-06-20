import type { RequestHandler } from "express";
import prisma from "../prisma";

export const acceptInvite: RequestHandler = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const invite = await prisma.invite.findUnique({ where: { code } });
  if (!invite) {
    return res.status(404).json({ error: "Invalid invite" });
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", invitedId: userId },
  });

  res.json({ success: true, roomId: invite.roomId });
};

export const declineInvite: RequestHandler = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const invite = await prisma.invite.findUnique({ where: { code } });
  if (!invite) {
    return res.status(404).json({ error: "Invalid invite" });
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "declined", invitedId: userId },
  });

  res.json({ success: true });
};

export const createInvite: RequestHandler = async (req, res) => {
  const { title, about, avatar, roomId, invitedId } = req.body;
  const code = `inv-${Date.now().toString(36)}`;

  const invite = await prisma.invite.create({
    data: {
      code,
      inviterId: req.user.id,
      invitedId: invitedId || null,
      roomId: roomId || null,
      title,
      about,
      avatar,
    },
  });

  res.status(201).json({ invite });
};
