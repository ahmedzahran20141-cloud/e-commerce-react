const bcrypt = require("bcryptjs");

const password = "CCIEsecurity2015";

console.log(bcrypt.hashSync(password, 10));