import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
app.use("/hotel-image", express.static("public/hotel-image"));
app.use("/room-image", express.static("public/room-image"));

app.use(bodyParser.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
dotenv.config();
const PORT = process.env.PORT || 5000;

import connection from "./database/connection.js";
if (connection) {
  console.log("Database connected successfully");
  app.listen(8080, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

app.use("/api/v1", hotelRoutes);
app.use("/api/v1", roomRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/auth", authRouter);
