const { Schema, default: mongoose } = require("mongoose");

const assetSchema = new Schema({
	name: {
		type: String,
	},
	multiplier: {
		type: String,
	},
	pipValue: {
		type: String,
	},
});

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
