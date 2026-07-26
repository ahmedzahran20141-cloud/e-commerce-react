const bcrypt = require("bcryptjs");

async function generateHash() {
  const hash = await bcrypt.hash("CCIEsecurity2015", 10);
  console.log("Hashed Password:", hash);
}

generateHash();