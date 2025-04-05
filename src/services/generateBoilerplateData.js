import Wigs from "../model/wigs.model.js"

export async function generateBoilerplateData(id) {
	const boilerplateData = [
		{
			description: "Gym",
			completed: false,
			user: id,
		},
		{
			description: "Read",
			completed: false,
			user: id,
		},
		{
			description: "Code",
			completed: false,
			user: id,
		},
	]

	try {
		await Wigs.insertMany(boilerplateData)
	} catch (error) {
		console.error("Failed to generate boilerplate data: ", error)
		throw new Error("Failed to generate boilerplate data")
	}
}
