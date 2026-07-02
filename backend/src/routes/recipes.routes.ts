import { Router } from "express";
import {
  create,
  favorite,
  feed,
  getOne,
  list,
  myFavorites,
  remove,
  unfavorite,
  update,
} from "../controllers/recipes.controller";
import { requireAuth } from "../middleware/auth";
import { recipeWriteRateLimiter } from "../middleware/rateLimiter";
import { upload } from "../middleware/upload";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(list));
router.get("/favorites", requireAuth, asyncHandler(myFavorites));
router.get("/feed", requireAuth, asyncHandler(feed));
router.get("/:id", asyncHandler(getOne));

router.post(
  "/",
  requireAuth,
  recipeWriteRateLimiter,
  upload.single("image"),
  asyncHandler(create)
);
router.put(
  "/:id",
  requireAuth,
  recipeWriteRateLimiter,
  upload.single("image"),
  asyncHandler(update)
);
router.delete("/:id", requireAuth, asyncHandler(remove));

router.post("/:id/favorite", requireAuth, asyncHandler(favorite));
router.delete("/:id/favorite", requireAuth, asyncHandler(unfavorite));

export default router;
