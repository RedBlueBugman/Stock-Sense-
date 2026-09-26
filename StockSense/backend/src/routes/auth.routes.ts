import { Router } from "express";
import { signup, login, forgotPassword, resetPassword, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, getMe);

export default router;
