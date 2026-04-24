import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "secret";

const generateToken = (payload) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: "24h"
    });
    return token;
};

const verifyToken = (token) => {
    const payload = jwt.verify(token, secret);
    return payload;
};

export { generateToken, verifyToken };
