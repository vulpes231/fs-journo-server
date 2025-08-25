const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createNewUser = async (req, res) => {
  const { username, password, fullname } = req.body;

  try {
    if (!username || !password || !fullname)
      return res.status(400).json({ message: "Bad request!" });

    const hashedPw = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      password: hashedPw,
      fullname: fullname,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occured." });
  }
};

module.exports = { createNewUser };
