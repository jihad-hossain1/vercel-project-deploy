import express from "express";
const router = express.Router();
import { codesController  } from "../controllers";

router.post("/", codesController.create);
router.get("/", codesController.get);
router.patch("/business/:codeId", codesController.update);
router.put("/business/:businessId/:id", codesController.archive);
router.get("/business/search/:businessId", codesController.searchCodes);

export default router;
