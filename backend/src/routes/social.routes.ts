import { Router } from "express";
import { follow, profile, search, suggestions, unfollow } from "../controllers/social.controller";
import { requireAuth } from "../middleware/auth";
import { searchRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/search", searchRateLimiter, asyncHandler(search));
router.get("/suggestions", asyncHandler(suggestions));
router.get("/:id", asyncHandler(profile));
router.post("/:id/follow", searchRateLimiter, asyncHandler(follow));
router.delete("/:id/follow", searchRateLimiter, asyncHandler(unfollow));

export default router;
