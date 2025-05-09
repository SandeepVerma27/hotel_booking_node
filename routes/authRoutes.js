import express from "express";
import { login, register, logout } from "../controller/authController.js";

const authRouter = express.Router();

// Route for user registration
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", logout);

export default authRouter;
