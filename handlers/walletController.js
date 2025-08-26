const { fetchUserWallets, fetchWallet } = require("../services/walletService");

const getUserWallets = async (req, res, next) => {
	const userId = req.user.userId;
	try {
		const userWallets = await fetchUserWallets(userId);
		res.status(200).json({
			data: userWallets,
			success: true,
			message: "User wallets fetched successfully.",
		});
	} catch (error) {
		next(error);
	}
};

const getWalletInfo = async (req, res, next) => {
	const { walletId } = req.params;
	try {
		const wallet = await fetchWallet(walletId);
		res.status(200).json({
			data: wallet,
			success: true,
			message: "Wallet info fetched successfully.",
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { getWalletInfo, getUserWallets };
