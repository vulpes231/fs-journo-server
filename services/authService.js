const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { throwError } = require("../utils/utils");
require("dotenv").config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

async function loginUserAccount(userData) {
	const { username, password } = userData;
	try {
		if (!username || !password)
			throw new Error("Username and password required!", { statusCode: 400 });

		const user = await User.findOne({ username });
		if (!user) throw new Error("User does not exist!", { statusCode: 400 });

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch)
			throw new Error("invalid username or password!", { statusCode: 400 });

		const accessToken = jwt.sign(
			{
				username: user.username,
				userId: user._id,
			},
			ACCESS_TOKEN,
			{ expiresIn: "1d" }
		);
		const refreshToken = jwt.sign(
			{
				username: user.username,
				userId: user._id,
			},
			REFRESH_TOKEN,
			{ expiresIn: "7d" }
		);

		user.refreshToken = refreshToken;
		user.save();

		const userInfo = {
			username: user.username,
			email: user.email,
			isBanned: user.security.isBanned,
		};
		return { accessToken, refreshToken, userInfo };
	} catch (error) {
		throwError(error, "failed to sign in user", 500);
	}
}

async function registerUser(userData) {
	const { username, password, email, firstname, lastname } = userData;
	try {
		if (!username || !password || !email || !firstname || !lastname)
			throw new Error("Bad request!", { statusCode: 400 });

		const mailExists = await User.findOne({ email });
		if (mailExists)
			throw new Error("Email already in use!", { statusCode: 409 });

		const user = await User.findOne({ username });
		if (user) throw new Error("User already exist!", { statusCode: 409 });

		const passwordHash = await bcrypt.hash(password, 10);

		const data = {
			username: username,
			password: passwordHash,
			fullname: {
				firstname: firstname,
				lastname: lastname,
			},
			email: email,
		};

		const newUser = await User.create(data);

		return newUser.username;
	} catch (error) {
		throwError(error, "Failed to register user!", 500);
	}
}

module.exports = { loginUserAccount, registerUser };
