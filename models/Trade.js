const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const tradeSchema = new Schema(
	{
		asset: {
			type: String,
		},
		orderType: {
			type: String,
			enum: ["buy", "sell"],
		},
		riskRatio: {
			type: String,
		},
		result: {
			type: String,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		execution: {
			entry: {
				type: Number,
			},
			exit: {
				type: Number,
			},
			stopLoss: {
				type: Number,
			},
			takeProfit: {
				type: Number,
			},
			closedAt: {
				type: Date,
			},
		},
	},
	{
		timestamps: true,
		toJSON: true,
		virtuals: true,
	}
);

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;
