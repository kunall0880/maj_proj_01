import express from "express";
import { addReview, getReviewsForUser } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/add", addReview);
router.get("/user/:id", getReviewsForUser);

export default router;


