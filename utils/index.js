function throwError(error, msg, code) {
	console.log(msg, error.message);
	throw new Error(msg, { statusCode: code });
}

function errResponse(error, res) {
	const statusCode = error.statusCode || 500;
	res
		.status(statusCode)
		.json({ message: error.message, success: false, data: null });
}

module.exports = { throwError, errResponse };
