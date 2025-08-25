const { registerUser } = require("../services/authService");
const { errResponse } = require("../utils/utils");

const createNewUser = async (req, res) => {
	if (!req.body)
		return res
			.status(400)
			.json({ message: "Input required fields!", success: false });
	try {
		const username = await registerUser(req.body);
		res.status(200).json({
			message: `${username} account created successfully.`,
			data: null,
			success: true,
		});
	} catch (error) {
		errResponse(error, res);
	}
};

module.exports = { createNewUser };
