import { Router } from "express"
import {
	getUserWigs,
	createWig,
	updateWig,
	deleteWig,
} from "./wigs.controller.js"
import { authorizeJWT } from "../../middleware/auth.js"

const router = Router()

router.get("/getUserWigs", authorizeJWT, getUserWigs)
router.post("/createWig", authorizeJWT, createWig)
router.put("/updateWig", authorizeJWT, updateWig)
router.delete("/deleteWig/:id", authorizeJWT, deleteWig)

export default router
