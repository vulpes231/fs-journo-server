const User = require("../models/User");
const {
	getUserInfo,
	editUserInfo,
	updateAccountPassword,
} = require("../services/userService");
const { errResponse } = require("../utils/utils");

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json({
			data: users,
			message: "User information fetched successfully.",
			success: true,
		});
	} catch (error) {
		errResponse(error, res);
	}
};

const getUser = async (req, res) => {
	const userId = req.userId;
	try {
		const user = await getUserInfo(userId);
		res.status(200).json({
			data: user,
			message: "User information fetched successfully.",
			success: true,
		});
	} catch (error) {
		errResponse(error, res);
	}
};

const updateUser = async (req, res) => {
	const userId = req.userId;
	try {
		const user = await editUserInfo(userId, req.body);
		res.status(200).json({
			data: user,
			message: "User information updated successfully.",
			success: true,
		});
	} catch (error) {
		errResponse(error, res);
	}
};

const changePassword = async (req, res) => {
	const userId = req.userId;
	try {
		await updateAccountPassword(userId, req.body);
		res.status(200).json({
			data: null,
			message: "Password updated successfully.",
			success: true,
		});
	} catch (error) {
		errResponse(error, res);
	}
};

module.exports = { getUser, updateUser, changePassword };
