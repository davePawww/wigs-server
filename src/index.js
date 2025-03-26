import express from "express"
import dbConnect from "./model/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import passportService from "./services/passport/passport.js"
import mainRouter from "./controller/main.route.js"
import logger from "./middleware/logger.js"
import session from "express-session"
import memorystore from "memorystore"

const app = express()
dbConnect()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(logger)
app.set("trust proxy", 1)

const MemoryStore = memorystore(session)
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 86400000,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			httpOnly: true,
		},
		store: new MemoryStore({
			checkPeriod: 86400000,
		}),
	})
)

app.use(passport.initialize())
app.use(passport.session())
passportService()

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
)

app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.use("/api", mainRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})

export default app
