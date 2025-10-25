import express from "express";
const router = express.Router();
import departmentController from "../controllers/department.controller";

router.post("/business", departmentController.create);
router.get("/business", departmentController.get);
router.get("/business/:id", departmentController.getById);
router.patch("/business/:id", departmentController.update);

export default router;
