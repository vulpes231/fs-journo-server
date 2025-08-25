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
		},
		winRate: {
			type: Number,
		},
		profitLoss: {
			type: String,
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
