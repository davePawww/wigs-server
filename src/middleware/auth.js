import jwt from "jsonwebtoken"

const authorizeJWT = (req, res, next) => {
	const jwtToken = req.cookies.token
	if (!jwtToken) {
		console.log("no auth header")
		return res.status(401).json({
			success: false,
			message: "Unauthorized",
		})
	}

	try {
		const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET)
		req.auth = decoded
		next()
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		})
	}
}

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next()
	}

	console.log("not authenticated")
	return res.status(401).json({
		success: false,
		message: "Unauthorized",
	})
}

export { authorizeJWT, isAuthenticated }
