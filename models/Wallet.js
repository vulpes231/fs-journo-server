const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		balance: {
			type: Number,
			default: 0,
		},
		name: {
			type: String,
		},
		winRate: {
			type: Number,
			default: 0,
		},
		profitLoss: {
			type: Number,
			default: 0,
		},
		isSuspended: {
			type: Boolean,
			default: false,
		},
		currency: {
			type: String,
			default: "USD",
		},
	},
	{
		timestamps: true,
		toJSON: true,
		virtuals: true,
	}
);

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
