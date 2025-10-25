import express from "express";
import businessController from "../controllers/business.controller";
const router = express.Router();

router.put("/", businessController.update);

export default router;
