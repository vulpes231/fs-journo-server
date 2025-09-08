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

	if (symbol.includes("jpy")) {
		pipSize = 0.01;
		contractSize = 100000;
	} else if (symbol === "xau/usd") {
		pipSize = 0.01;
		contractSize = 100; // 100 oz per lot
		// For gold, pip value does NOT divide by price
		return pipSize * contractSize * lotSize;
	} else if (["us30", "nas100"].includes(symbol)) {
		pipSize = 1;
		contractSize = 1;
		return pipSize * contractSize * lotSize;
	} else {
		pipSize = 0.0001;
		contractSize = 100000; // default forex lot
	}

	// For forex, divide by price
	return (pipSize * contractSize * lotSize) / price;
}

module.exports = { HttpError, calculatePipValue };
