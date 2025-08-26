const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { logRequest, logError } = require("./middlewares/logger");
const { connectDB } = require("./configs/connectDB.js");
const { default: mongoose } = require("mongoose");
const verifyJWT = require("./middlewares/verifyJWT.js");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 2500;

app.use(cors({ origin: true }));

connectDB();

app.use(logRequest);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// endpoints
app.use("/signup", require("./routes/register.js"));
app.use("/signin", require("./routes/auth.js"));
app.use("/", require("./routes/root.js"));

app.use(verifyJWT);
app.use("/user", require("./routes/user.js"));
app.use("/wallet", require("./routes/wallet.js"));

app.use(errorHandler);
app.use(logError);

mongoose.connection.once("connected", () => {
	app.listen(PORT, () =>
		console.log(`Server started on http://localhost:${PORT}`)
	);
});
