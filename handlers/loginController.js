const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "username and password required!" });

    const user = await User.findOne({ username: username });

    if (!user) return res.status(400).json({ message: "user does not exist!" });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(400).json({ message: "invalid username or password!" });

    const accessToken = jwt.sign(
      {
        user: user.username,
      },
      ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        user: user.username,
      },
      REFRESH_TOKEN,
      { expiresIn: "2 days" }
    );

    user.refreshToken = refreshToken;
    user.save();

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occured. Try again." });
  }
};

module.exports = { loginUser };
