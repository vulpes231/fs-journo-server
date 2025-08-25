const { loginUserAccount } = require("../services/authService");

const loginUser = async (req, res) => {
	const { username, password } = req.body;
	try {
		const { accessToken, refreshToken, userInfo } = await loginUserAccount({
			username,
			password,
		});

		res.cookie("jwt", refreshToken, {
			maxAge: 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		res.status(200).json({ token: accessToken, data: userInfo, success: true });
	} catch (error) {
		next(error);
	}
};

module.exports = { loginUser };
