import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: String,
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordTokenExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		providerId: String,
		provider: {
			type: String,
			enum: ["local", "google"],
			default: "local",
		},
	},
	{
		timestamps: true,
	}
)

const User = mongoose.models?.User || mongoose.model("User", userSchema)

export default User
