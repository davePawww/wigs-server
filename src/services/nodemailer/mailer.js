import nodemailer from "nodemailer"
import {
	verificationTokenEmailTemplate,
	welcomeEmailTemplate,
	resetPasswordEmailTemplate,
	resetPasswordSuccessEmailTemplate,
} from "./emailTemplates.js"

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NODEMAILER_GMAIL_USER,
		pass: process.env.NODEMAILER_GMAIL_PASSWORD,
	},
})

export const sendVerificationEmail = async (email, verificationToken) => {
	const mapObj = {
		appName: "appName",
		verificationToken,
	}

	try {
		const info = await transporter.sendMail({
			from: process.env.NODEMAILER_GMAIL_USER,
			to: email,
			subject: "[appName] Verify your email",
			html: verificationTokenEmailTemplate.replace(
				/\b(?:appName|verificationToken)\b/gi,
				(matched) => mapObj[matched]
			),
		})

		console.log("Verification email sent:", info)
	} catch (error) {
		console.log("Error sending verification email:", error)
		throw new Error("Error sending verification email")
	}
}

export const sendWelcomeEmail = async (email, name) => {
	const mapObj = {
		appName: "appName",
		userName: name,
		documentationUrl: `${process.env.CLIENT_URL}/documentation`,
	}

	try {
		const info = await transporter.sendMail({
			from: process.env.NODEMAILER_GMAIL_USER,
			to: email,
			subject: "[appName] Welcome to appName!",
			html: welcomeEmailTemplate.replace(
				/\b(?:appName|userName|documentationUrl)\b/gi,
				(matched) => mapObj[matched]
			),
		})

		console.log("Welcome email sent:", info)
	} catch (error) {
		console.log("Error sending welcome email:", error)
		throw new Error("Error sending welcome email")
	}
}

export const sendPasswordResetEmail = async (email, link) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.NODEMAILER_GMAIL_USER,
			to: email,
			subject: "[appName] Reset your password!",
			html: resetPasswordEmailTemplate.replace("resetPasswordUrl", link),
		})

		console.log("Password reset email sent:", info)
	} catch (error) {
		console.log("Error sending password reset email:", error)
		throw new Error("Error sending password reset email")
	}
}

export const sendResetPasswordSuccessEmail = async (email) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.NODEMAILER_GMAIL_USER,
			to: email,
			subject: "[appName] Password reset successful",
			html: resetPasswordSuccessEmailTemplate.replace(
				"loginUrl",
				`${process.env.CLIENT_URL}/auth/login`
			),
		})

		console.log("Password reset success email sent:", info)
	} catch (error) {
		console.log("Error sending password reset success email:", error)
		throw new Error("Error sending password reset success email")
	}
}
