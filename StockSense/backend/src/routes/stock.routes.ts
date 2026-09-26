import { Router } from "express";
import { getStockQuants, getMoveHistory } from "../controllers/stock.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/quants", getStockQuants);
router.get("/moves", getMoveHistory);

export default router;
