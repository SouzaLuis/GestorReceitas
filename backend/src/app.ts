import cors from "cors";
import express from "express";
import helmet from "helmet";
import passport from "./config/passport";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import mealPlansRoutes from "./routes/mealPlans.routes";
import recipesRoutes from "./routes/recipes.routes";
import socialRoutes from "./routes/social.routes";
import usersRoutes from "./routes/users.routes";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", usersRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/meal-plans", mealPlansRoutes);
app.use("/api/users", socialRoutes);

app.use(errorHandler);

export default app;
