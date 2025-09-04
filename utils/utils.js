class HttpError extends Error {
	constructor(message, statusCode = 500) {
		super(message);
		this.statusCode = statusCode;
		// Ensure the error name is the class name
		this.name = this.constructor.name;
		// Capture stack trace for better debugging
		Error.captureStackTrace(this, this.constructor);
	}
}

function calculatePipValue(symbol, lotSize, price, accountCurrency) {
	let pipSize;
	let contractSize;

	if (symbol.includes("JPY")) pipSize = 0.01;
	else if (symbol === "XAU/USD") {
		pipSize = 0.01;
		contractSize = 100;
	} else if (["US30", "NAS100"].includes(symbol)) {
		pipSize = 1;
		contractSize = 1;
	} else pipSize = 0.0001;

	if (!contractSize) contractSize = 100000; // default forex lot

	const pipValue = (pipSize * contractSize * lotSize) / price;
	return pipValue;
}

module.exports = { HttpError, calculatePipValue };
