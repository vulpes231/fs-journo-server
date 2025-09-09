const User = require("../models/User");
const {
	getUserInfo,
	editUserInfo,
	updateAccountPassword,
	logoutUserAccount,
} = require("../services/userService");
const { errResponse } = require("../utils/utils");

const getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find();
		res.status(200).json({
			data: users,
			message: "User information fetched successfully.",
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const getUser = async (req, res, next) => {
	const userId = req.user.userId;
	try {
		const user = await getUserInfo(userId);
		res.status(200).json({
			data: user,
			message: "User information fetched successfully.",
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const updateUser = async (req, res, next) => {
	const userId = req.user.userId;
	try {
		const user = await editUserInfo(userId, req.body);
		res.status(200).json({
			data: user,
			message: "User information updated successfully.",
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const changePassword = async (req, res, next) => {
	const userId = req.user.userId;
	const { password, newPassword } = req.body;
	try {
		await updateAccountPassword(userId, { password, newPassword });
		res.status(200).json({
			data: null,
			message: "Password updated successfully.",
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const logoutUser = async (req, res, next) => {
	const userId = req.user.userId;
	try {
		console.log(userId);
		await logoutUserAccount(userId);
		res.clearCookie("jwt", { secure: true, httpOnly: true });
		console.log("success");
		res.status(200).json({
			data: null,
			message: "Logout successfully.",
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { getUser, updateUser, changePassword, logoutUser };
