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
		status: {
			type: String,
			enum: ["open", "closed"],
			default: "open",
		},
		result: {
			type: String,
			enum: ["won", "lost", "break even"],
		},
		wallet: {
			id: { type: Schema.Types.ObjectId, ref: "Wallet" },
			name: { type: String },
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		execution: {
			entry: {
				type: Number,
				default: 0,
			},
			stopLoss: {
				type: Number,
				default: 0,
			},
			takeProfit: {
				type: Number,
				default: 0,
			},
			lotSize: {
				type: String,
			},
			totalReturn: {
				type: Number,
				default: 0,
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

tradeSchema.index({ status: -1 });

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;
