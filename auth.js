const argon2 = require("argon2");
var jwt = require("jsonwebtoken");
const database = require("./database");

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

const verifyPassword = async (req, res) => {
    try {
        if (await argon2.verify(req.user.hashedPassword, req.body.password)) {
            const payload = {
                fistname: req.user.firstname,
                email: req.user.email,
                city: req.user.city,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            delete req.user.hashedPassword;
            res.send(token);
        } else res.sendStatus(401);
    } catch (err) {
        console.log(err);
    }
};

const verifyToken = (req, res, next) => {
    try {
        const authorizationHeader = req.get("Authorization");
        if (authorizationHeader == null) {
            throw new Error("Auth header is missing");
        }
        const [type, token] = authorizationHeader.split(" ");

        if (type != "Bearer")
            throw new Error("Auth header has not the Bearer type");
        req.payload = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        console.log(err);
        res.sendStatus(401);
    }
};

const verifyUser = (req, res, next) => {
    const id = req.params.id;
    database
        .query("select email from users where id = ?", [id])
        .then(([result]) => {
            if (result[0].email === req.payload.email) {
                console.log("test");
                next();
            } else {
                res.sendStatus(403);
            }
        });
};

module.exports = {
    hashPassword,
    verifyPassword,
    verifyToken,
    verifyUser,
};
