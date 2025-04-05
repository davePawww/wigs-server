import { Router } from "express"
import authRouter from "./auth/auth.route.js"
import wigsRouter from "./wigs/wigs.route.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/wigs", wigsRouter)

export default router
