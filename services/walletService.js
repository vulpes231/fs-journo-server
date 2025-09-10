const Wallet = require("../models/Wallet");
const { HttpError } = require("../utils/utils");

async function fetchUserWallets(userId) {
	if (!userId) throw new HttpError("Bad request!", 400);
	try {
		const userWallets = await Wallet.find({ userId });
		return userWallets;
	} catch (error) {
		throw new HttpError("Failed to get user wallets!", 500);
	}
}

async function fetchWallet(walletId) {
	if (!walletId) throw new HttpError("Bad request!", 400);
	try {
		const wallet = await Wallet.findById(walletId);
		return wallet;
	} catch (error) {
		throw new HttpError("Failed to get wallet!", 500);
	}
}

async function suspendUserWallet(walletId) {
	if (!walletId) throw new HttpError("Bad request!", 400);
	try {
		const updatedWallet = await Wallet.findByIdAndUpdate(
			walletId,
			{ $bit: { isSuspended: { xor: 1 } } }, // flips true <-> false
			{ new: true, runValidators: true }
		);

		if (!updatedWallet) throw new HttpError("Wallet not found", 404);
		return updatedWallet;
	} catch (error) {
		throw new HttpError("Failed to suspend user wallet", 500);
	}
}

async function updateUserBalance(walletId, walletData) {
	const { balance } = walletData;
	if (!balance || !walletId) throw new HttpError("Bad request!", 400);

	try {
		const parsedBal = parseFloat(balance);
		if (parsedBal <= 0)
			throw new HttpError("Balance must be greater than 0!", 400);

		const wallet = await Wallet.findById(walletId);
		if (!wallet) throw new HttpError("Wallet not found", 404);

		wallet.balance += balance;
		await wallet.save();

		return wallet;
	} catch (error) {
		throw new HttpError("Failed to update user wallet balance", 500);
	}
}

module.exports = { fetchUserWallets, fetchWallet, updateUserBalance };
