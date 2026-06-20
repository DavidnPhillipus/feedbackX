import express from "express";
import { getAllRooms, getRoom, getRoomMessages } from "../chat/store";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ rooms: getAllRooms() });
});

router.get("/:id", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
});

router.get("/:id/messages", (req, res) => {
  const messages = getRoomMessages(req.params.id);
  res.json({ messages });
});

export default router;
