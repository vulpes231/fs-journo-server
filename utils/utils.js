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

module.exports = { HttpError };
