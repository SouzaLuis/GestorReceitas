import { Router } from "express";
import passport from "../config/passport";
import { googleCallback, login, register } from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", authRateLimiter, asyncHandler(register));
router.post("/login", authRateLimiter, asyncHandler(login));

router.get(
  "/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router;
