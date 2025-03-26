import mongoose from "mongoose"

const connectToDB = async () => {
	try {
		const connection = await mongoose.connect(process.env.MONGODB_URI)
		console.log("Connected to db: ", connection.connection.db.databaseName)
	} catch (error) {
		console.log("Error connecting to db: ", error)
	}
}

export default connectToDB
