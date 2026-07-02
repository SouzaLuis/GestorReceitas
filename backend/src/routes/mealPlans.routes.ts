import { Router } from "express";
import {
  addPlanItem,
  getPlan,
  removePlanItem,
  shoppingList,
} from "../controllers/mealPlans.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getPlan));
router.post("/items", asyncHandler(addPlanItem));
router.delete("/items/:id", asyncHandler(removePlanItem));
router.get("/shopping-list", asyncHandler(shoppingList));

export default router;
