const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const tradeSchema = new Schema({
	asset: {
		type: String,
	},
});

module.exports = mongoose.model("Trade", tradeSchema);
