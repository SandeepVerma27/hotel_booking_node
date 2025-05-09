import express from "express";
import {
  addRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} from "../controller/roomManageController.js";

import createUploader from "../middleware/uploadMiddleware.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const roomUpload = createUploader("rooms-images");

const roomRoutes = express.Router();

roomRoutes.post(
  "/room",
  roomUpload.single("room_image"),
  authenticateToken,
  authorizeRoles("admin"),
  addRoom
);
roomRoutes.get(
  "/rooms",
  authenticateToken,
  authorizeRoles("admin"),
  getAllRooms
);
roomRoutes.get(
  "/room/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getRoom
);
roomRoutes.put(
  "/room/:id",
  roomUpload.single("room_image"),
  authenticateToken,
  authorizeRoles("admin"),
  updateRoom
);
roomRoutes.delete(
  "/room/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteRoom
);

export default roomRoutes;
