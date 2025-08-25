const { loginUserAccount } = require("../services/authService");
const { errResponse } = require("../utils");

const loginUser = async (req, res) => {
	const { username, password } = req.body;
	try {
		const { accessToken, refreshToken, userInfo } = await loginUserAccount({
			username,
			password,
		});

		res.cookie("jwt", refreshToken, {
			maxAge: 24 * 60 * 1000,
			httpOnly: true,
		});

		res.status(200).json({ token: accessToken, data: userInfo, success: true });
	} catch (error) {
		errResponse(error, res);
	}
};

module.exports = { loginUser };
