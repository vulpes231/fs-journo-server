const {
	addAsset,
	editAsset,
	fetchAssets,
} = require("../services/assetService");

const createAsset = async (req, res, next) => {
	const assetData = req.body;
	try {
		const asset = await addAsset(assetData);
		res.status(200).json({
			data: null,
			success: true,
			message: `${asset} created successfully.`,
		});
	} catch (error) {
		next(error);
	}
};

const updateAsset = async (req, res, next) => {
	const assetData = req.body;
	const { assetId } = req.params;
	if (!assetId) return res.status(400).json({ message: "Asset ID required!" });
	try {
		const asset = await editAsset(assetId, assetData);
		res.status(200).json({
			data: null,
			success: true,
			message: `${asset.name} updated successfully.`,
		});
	} catch (error) {
		next(error);
	}
};

const getAssets = async (req, res, next) => {
	try {
		const assets = await fetchAssets();
		res
			.status(200)
			.json({
				message: "Assets fetched succesfully.",
				data: assets,
				success: true,
			});
	} catch (error) {
		next(error);
	}
};

module.exports = { createAsset, updateAsset, getAssets };
