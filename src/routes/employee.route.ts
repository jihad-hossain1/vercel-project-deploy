import express from "express";
import employeeController from "../controllers/employee.controller";
const router = express.Router();

// Employee CRUD routes

router.post("/business", employeeController.createEmployee);
router.get("/business", employeeController.getEmployeesByBusiness);
router.get("/business/:id", employeeController.getEmployeeById);
router.put("/business/:id", employeeController.updateEmployee);

export default router;
