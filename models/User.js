const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	fullname: {
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
	},
	security: {
		isBanned: {
			type: Boolean,
			default: false,
		},
		twoFaActivated: {
			type: Boolean,
			default: false,
		},
	},
	refreshToken: {
		type: String,
	},
});

module.exports = mongoose.model("User", userSchema);
