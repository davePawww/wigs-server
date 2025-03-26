import jwt from "jsonwebtoken"

const generateJWTToken = (res, userId) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	})

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		maxAge: 30 * 24 * 60 * 60 * 1000,
	})
}

export default generateJWTToken
