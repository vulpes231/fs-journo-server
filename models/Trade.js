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
		risk: {
			ratio: { type: String },
			percent: { type: String },
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
				point: { type: Number, default: 0 },
				usdValue: { type: Number, default: 0 },
			},
			takeProfit: {
				point: { type: Number, default: 0 },
				usdValue: { type: Number, default: 0 },
			},
			lotSize: {
				type: String,
			},
		},
		performance: {
			totalReturn: {
				type: Number,
				default: 0,
			},
			closePrice: {
				type: Number,
				default: 0,
			},
			closedAt: {
				type: Date,
			},
			status: {
				type: String,
				enum: ["open", "closed"],
				default: "open",
			},
			result: {
				type: String,
				enum: ["won", "loss", "break even", "pending"],
				default: "pending",
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
