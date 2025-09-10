const User = require("../models/User");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/utils");
require("dotenv").config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN_SECRET;

async function loginUserAccount(userData) {
	const { username, password } = userData;
	try {
		if (!username || !password)
			throw new HttpError("Username and password required!", 400);

		const user = await User.findOne({ username }).select("+password");
		if (!user) throw new HttpError("User does not exist!", 400);

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch)
			throw new HttpError("invalid username or password!", 400);

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
		throw new HttpError(error.message, 500);
	}
}

async function registerUser(userData) {
	const { username, password, email, firstname, lastname, phone, currency } =
		userData;
	try {
		if (
			!username ||
			!password ||
			!email ||
			!firstname ||
			!lastname ||
			!currency
		)
			throw new HttpError("Bad request!", 400);

		const mailExists = await User.findOne({ email });
		if (mailExists) throw new HttpError("Email already in use!", 409);

		const user = await User.findOne({ username });
		if (user) throw new HttpError("User already exist!", 409);

		// console.log(user);

		const passwordHash = await bcrypt.hash(password, 10);

		const data = {
			username: username,
			password: passwordHash,
			fullname: {
				firstname: firstname,
				lastname: lastname,
			},
			phone: phone || null,
			email: email,
		};

		const newUser = await User.create(data);

		await Wallet.create({
			name: "wallet 1",
			userId: newUser._id,
			currency: currency || "usd",
		});

		return newUser.username;
	} catch (error) {
		throw new HttpError("Failed to register user!", 500);
	}
}

module.exports = { loginUserAccount, registerUser };
