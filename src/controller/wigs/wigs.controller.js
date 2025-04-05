import Wigs from "../../model/wigs.model.js"

export const getAllById = async (req, res) => {
	const { id } = req.query
	console.log("here	", id)
	try {
		const wigs = await Wigs.find({ user: id })
		res.status(200).json({
			success: true,
			message: "Wigs fetched successfully",
			wigs: wigs,
		})
	} catch (error) {
		console.error("Failed to get all wigs: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to get wigs",
		})
	}
}
