const Asset = require("../models/Asset");
const { HttpError } = require("../utils/utils");

async function addAsset(assetData) {
	const { name } = assetData;
	try {
		const asset = await Asset.create({ name });
		return asset.name;
	} catch (error) {
		throw new HttpError(error.message, 500);
	}
}

async function editAsset(assetId, assetData) {
	const { name } = assetData;
	try {
		const asset = await Asset.findById(assetId);
		if (!asset) throw new HttpError("Asset not found!", 400);

		if (name) asset.name = name;

		await asset.save();
		return asset;
	} catch (error) {
		throw new HttpError(error.message, 500);
	}
}

async function fetchAssets() {
	try {
		const assets = await Asset.find().lean();
		return assets;
	} catch (error) {
		throw new HttpError(error.message, 500);
	}
}

async function fetchAssetById(assetId) {
	try {
		const asset = await Asset.findById(assetId);
		if (!asset) throw new HttpError("Asset not found!", 400);
		return asset;
	} catch (error) {
		throw new HttpError(error.message, 500);
	}
}

module.exports = { fetchAssets, fetchAssetById, editAsset, addAsset };
