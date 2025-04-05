import User from "../../model/user.model.js"
import bcrypt from "bcryptjs"
import generateVerificationToken from "../../services/tokens/generateVerificationToken.js"
import generateJWTToken from "../../services/tokens/generateJWTToken.js"
import {
	sendPasswordResetEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
	sendResetPasswordSuccessEmail,
} from "../../services/nodemailer/mailer.js"
import passport from "passport"
import crypto from "crypto"

// @desc 		Register user
// @route 	POST /api/auth/register
// @access 	Public
export const register = async (req, res) => {
	const { name, email, password } = req.body

	try {
		if (!name || !email || !password) {
			return res.status(422).json({
				success: false,
				message: "Required field(s) missing",
			})
		}

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: "Email already in use",
			})
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			isVerified: false,
			verificationToken: generateVerificationToken(),
			verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
			provider: "local",
		})

		await newUser.save()
		generateJWTToken(res, newUser._id)
		await generateBoilerplateData(newUser._id)
		await sendVerificationEmail(newUser.email, newUser.verificationToken)

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			user: {
				...newUser._doc,
				password: undefined,
			},
		})
	} catch (error) {
		console.error("Failed to register user: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to register user",
		})
	}
}

// @desc 		Verify user
// @route 	POST /api/auth/verify-email
// @access 	Public
export const verifyEmail = async (req, res) => {
	const { verificationToken } = req.body

	try {
		const user = await User.findOne({
			verificationToken,
			verificationTokenExpiresAt: { $gt: Date.now() },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Invalid or expired token",
			})
		}

		user.isVerified = true
		user.verificationToken = undefined
		user.verificationTokenExpiresAt = undefined
		await user.save()
		await sendWelcomeEmail(user.email, user.name)

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
		})
	} catch (error) {
		console.error("Failed to verify email: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to verify email",
		})
	}
}

// @desc 		Login
// @route 	POST /api/auth/login
// @access 	Public
export const login = async (req, res) => {
	passport.authenticate("local", (error, user, info) => {
		if (error) {
			return res.status(500).json({
				success: false,
				message: "Internal Server Error",
			})
		}

		if (!user) {
			return res.status(401).json({
				success: false,
				message: info.message,
			})
		}

		generateJWTToken(res, user._id)
		req.login(user, (error) => {
			if (error) {
				return res.status(500).json({
					success: false,
					message: "Internal Server Error",
				})
			}

			return res.status(200).json({
				success: true,
				message: "User logged in successfully",
				user: {
					...user._doc,
					password: undefined,
				},
			})
		})
	})(req, res)
}

// @desc 		Login
// @route 	POST /api/auth/login
// @access 	Public
export const logout = async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	})

	req.logout((error) => {
		if (error) {
			console.log("error1")
			return res.status(500).json({
				success: false,
				message: "Internal Server Error",
			})
		}

		req.session.destroy((error) => {
			console.log("session destroy")
			if (error) {
				console.log("error2")
				return res.status(500).json({
					success: false,
					message: "Failed to destroy session",
				})
			}

			return res.status(204).json({
				success: true,
				message: "User logged out successfully",
			})
		})
	})
}

// @desc 		Check if user is authenticated and authorized
// @route 	GET /api/auth/me
// @access 	Private
export const checkAuth = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "User is authorized",
		user: {
			...req.user._doc,
			password: undefined,
		},
	})
}

// @desc 		Login with Google
// @route 	GET /api/auth/google
// @access 	Public
export const googleLogin = passport.authenticate("google", {
	scope: ["profile", "email"],
})

// @desc 		Callback for Google login
// @route 	GET /api/auth/google/callback
// @access 	Public
export const googleLoginCallback = (req, res) => {
	generateJWTToken(res, req.user._id)
	res.redirect(process.env.CLIENT_URL)
}

// @desc 		Forgot password
// @route 	POST /api/auth/forgot-password
// @access 	Public
export const forgotPassword = async (req, res) => {
	const { email } = req.body
	console.log(email)

	try {
		const user = await User.findOne({ email })
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			})
		}

		user.resetPasswordToken = crypto.randomBytes(32).toString("hex")
		user.resetPasswordTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
		await user.save()

		await sendPasswordResetEmail(
			user.email,
			`${process.env.CLIENT_URL}/auth/reset-password/${user.resetPasswordToken}`
		)

		res.status(200).json({
			success: true,
			message: "Reset password email sent",
		})
	} catch (error) {
		console.log("Failed to send reset password email: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to send reset password email",
		})
	}
}

// @desc 		Reset password
// @route 	POST /api/auth/reset-password
// @access 	Public
export const resetPassword = async (req, res) => {
	const { token } = req.params
	const { password } = req.body

	try {
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpiresAt: { $gt: Date.now() },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Invalid or expired token",
			})
		}

		user.password = await bcrypt.hash(password, 10)
		user.resetPasswordToken = undefined
		user.resetPasswordTokenExpiresAt = undefined
		await user.save()

		await sendResetPasswordSuccessEmail(user.email)

		res.status(200).json({
			success: true,
			message: "Password reset successfully",
		})
	} catch (error) {
		console.log("Failed to reset password: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to reset password",
		})
	}
}
