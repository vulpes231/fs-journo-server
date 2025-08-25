const User = require("../models/User");
const { throwError } = require("../utils/utils");
const bcrypt = require("bcryptjs");

async function getUserInfo(userId) {
	if (!userId) throw new Error("Bad request!", { statusCode: 400 });
	try {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found!", { statusCode: 404 });
		return user;
	} catch (error) {
		throwError(error, "Failed to get user information!", 500);
	}
}

async function editUserInfo(userId, userData) {
	if (!userId) throw new Error("Bad request!", { statusCode: 400 });

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

		if (!updatedUser) throw new Error("User not found!", { statusCode: 404 });

		return updatedUser;
	} catch (error) {
		throwError(error, "Failed to edit user information!", 500);
	}
}

async function updateAccountPassword(userId, userData) {
	if (!userId) throw new Error("Bad request!", { statusCode: 400 });
	const { password, newPassword } = userData;
	if (!password || !newPassword)
		throw new Error("All fields required!", { statusCode: 400 });
	try {
		const user = getUserInfo(userId);

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch)
			throw new Error("Invalid password!", { statusCode: 400 });

		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		user.password = newPasswordHash;
		await user.save();
		return true;
	} catch (error) {
		throwError(error, "Failed to update account password!", 500);
	}
}

module.exports = { getUserInfo, editUserInfo, updateAccountPassword };
