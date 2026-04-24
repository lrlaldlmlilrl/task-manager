import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Невалидный токен" });
    }
};

export { authMiddleware };
