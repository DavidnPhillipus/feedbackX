import express from "express";
import { getAllRooms, getRoom, getRoomMessages, hydrateRoomMessages } from "../chat/store";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ rooms: getAllRooms() });
});

router.get("/:id", async (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
});

router.get("/:id/messages", async (req, res) => {
  await hydrateRoomMessages(req.params.id);
  const messages = getRoomMessages(req.params.id);
  res.json({ messages });
});

export default router;
