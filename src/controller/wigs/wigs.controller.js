import Wigs from "../../model/wigs.model.js"

export const getUserWigs = async (req, res) => {
	const id = req.auth.userId
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

export const createWig = async (req, res) => {
	const id = req.auth.userId
	const { description } = req.body

	if (!description) {
		return res.status(400).json({
			success: false,
			message: "Description is required",
		})
	}

	try {
		const wig = await Wigs.create({
			description,
			user: id,
		})

		res.status(201).json({
			success: true,
			message: "Wig created successfully",
			wig: wig,
		})
	} catch (error) {
		console.error("Failed to create wig: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to create wig",
		})
	}
}

export const updateWig = async (req, res) => {
	const { _id, description, completed } = req.body

	try {
		const wig = await Wigs.findById(_id)
		if (!wig) {
			return res.status(404).json({
				success: false,
				message: "Wig not found",
			})
		}

		if (!description) {
			return res.status(400).json({
				success: false,
				message: "Description is required",
			})
		}

		wig.description = description
		wig.completed = completed
		await wig.save()

		res.status(200).json({
			success: true,
			message: "Wig updated successfully",
			wig: wig,
		})
	} catch (error) {
		console.error("Failed to update wig: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to update wig",
		})
	}
}

export const deleteWig = async (req, res) => {
	const { id } = req.params
	try {
		const wig = await Wigs.findByIdAndDelete(id)
		if (!wig) {
			return res.status(404).json({
				success: false,
				message: "Wig not found",
			})
		}

		res.status(200).json({
			success: true,
			message: "Wig deleted successfully",
		})
	} catch (error) {
		console.error("Failed to delete wig: ", error)
		res.status(500).json({
			success: false,
			message: "Failed to delete wig",
		})
	}
}
