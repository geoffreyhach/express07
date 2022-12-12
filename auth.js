const argon2 = require("argon2");

const hashPassword = async (req, res, next) => {
    try {
        req.body.hashedPassword = await argon2.hash(req.body.password, {
            type: argon2.argon2d,
            memoryCost: 2 ** 16,
            hashLength: 50,
        });

        delete req.body.password;
        next();
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    hashPassword,
};
