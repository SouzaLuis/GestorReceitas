import { Router } from "express";
import { me } from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/me", requireAuth, asyncHandler(me));

export default router;
