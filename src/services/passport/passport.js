import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import bcrypt from "bcryptjs"
import User from "../../model/user.model.js"
import { sendWelcomeEmail } from "../nodemailer/mailer.js"

const passportService = () => {
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					const user = await User.findOne({ email })
					if (!user) {
						return done(null, false, { message: "Incorrect email or password" })
					}

					const isPasswordMatch = await bcrypt.compare(password, user.password)
					if (!isPasswordMatch) {
						return done(null, false, { message: "Incorrect email or password" })
					}

					done(null, user)
				} catch (error) {
					done(error)
				}
			}
		)
	)

	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/api/auth/google/callback",
			},
			async (accesToken, refreshToken, profile, done) => {
				// TODO: Could be improved
				// if user already used traditional login with email and password, we could link the account together
				// vice versa, if user already used google login, we could link the account together if they choose to register with traditional email and password
				// for now, we will just check if the user already exists in the database
				try {
					const existingUser = await User.findOne({ providerId: profile.id })
					if (existingUser) {
						if (existingUser.email === profile.email) {
							return done(null, false, { message: "Email already in use" })
						}

						return done(null, existingUser)
					}

					const newUser = await new User({
						name: profile.displayName,
						email: profile.emails[0].value,
						provider: "google",
						providerId: profile.id,
						isVerified: true,
					})

					await newUser.save()
					await sendWelcomeEmail(newUser.email, newUser.name)

					done(null, newUser)
				} catch (error) {
					done(error)
				}
			}
		)
	)

	passport.serializeUser((user, done) => {
		done(null, user._id)
	})

	passport.deserializeUser(async (userId, done) => {
		try {
			const user = await User.findById(userId)
			if (!user) {
				return done(new Error("User not found"))
			}

			done(null, user)
		} catch (error) {
			done(error)
		}
	})
}

export default passportService
