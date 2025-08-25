const User = require("../models/User");
const { HttpError } = require("../utils/utils");
const bcrypt = require("bcryptjs");

async function getUserInfo(userId) {
	if (!userId) throw new HttpError("Bad request!", 400);
	try {
		const user = await User.findById(userId);
		if (!user) throw new HttpError("User not found!", 404);
		return user;
	} catch (error) {
		throw new HttpError("Failed to get user information!", 500);
	}
}

async function editUserInfo(userId, userData) {
	if (!userId) throw new HttpError("Bad request!", 400);

	const { username, firstname, lastname, email } = userData;

	try {
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				...(username && { username }),
				...(email && { email }),
				...(firstname && { "fullname.firstname": firstname }),
				...(lastname && { "fullname.lastname": lastname }),
			},
			{ new: true, runValidators: true } // new = return updated doc, runValidators = apply schema validation
		);

		if (!updatedUser) throw new HttpError("User not found!", 404);

		return updatedUser;
	} catch (error) {
		throw new HttpError("Failed to edit user information!", 500);
	}
}

async function updateAccountPassword(userId, userData) {
	if (!userId) throw new HttpError("Bad request!", 400);
	const { password, newPassword } = userData;
	if (!password || !newPassword)
		throw new HttpError("All fields required!", 400);
	try {
		const user = getUserInfo(userId);

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) throw new HttpError("Invalid password!", 400);

		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		user.password = newPasswordHash;
		await user.save();
		return true;
	} catch (error) {
		throw new HttpError("Failed to update account password!", 500);
	}
}

async function logoutUserAccount(userId) {
	if (!userId) throw new HttpError("Bad request!", 400);

	try {
		const loggedOutUser = await User.findByIdAndUpdate(userId, {
			refreshToken: null,
		});

		if (!loggedOutUser) throw new HttpError("User not found!", 404);
		return loggedOutUser;
	} catch (error) {
		throw new HttpError("Failed to logout user account!", 500);
	}
}

module.exports = {
	getUserInfo,
	editUserInfo,
	updateAccountPassword,
	logoutUserAccount,
};
