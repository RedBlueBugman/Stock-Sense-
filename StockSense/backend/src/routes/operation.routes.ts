import { Router } from "express";
import { createOp, transitionOp, getOperations, getOperationById } from "../controllers/operation.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.post("/", createOp);
router.patch("/:id/transition", transitionOp);
router.get("/", getOperations);
router.get("/:id", getOperationById);

export default router;
