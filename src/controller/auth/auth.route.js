import { Router } from "express"
import {
	login,
	logout,
	register,
	verifyEmail,
	checkAuth,
	googleLogin,
	forgotPassword,
	resetPassword,
	googleLoginCallback,
} from "./auth.controller.js"
import { authorizeJWT, isAuthenticated } from "../../middleware/auth.js"
import passport from "passport"

const router = Router()

router.post("/register", register)
router.post("/verify-email", verifyEmail)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", isAuthenticated, authorizeJWT, checkAuth)
router.get("/google", googleLogin)
router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: false }),
	googleLoginCallback
)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

export default router
