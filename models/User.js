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
	phone: {
		type: String,
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
	currency: {
		type: String,
		default: "usd",
	},
	settings: {
		maxRiskPerTrade: {
			type: String,
			default: "0.15",
		},
		utc: {
			type: String,
		},
	},
	refreshToken: {
		type: String,
	},
});

module.exports = mongoose.model("User", userSchema);
