import { Router } from "express"
import { getAllById } from "./wigs.controller.js"

const router = Router()

router.get("/findById", getAllById)

export default router
