import { Router } from "express"
import { getUserWigs } from "./wigs.controller.js"
import { authorizeJWT } from "../../middleware/auth.js"

const router = Router()

router.get("/getUserWigs", authorizeJWT, getUserWigs)

export default router
