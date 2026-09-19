const jwt = require("jsonwebtoken");

function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    if (authHeader) {
        return authHeader;
    }
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
}

function verifyAdmin(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ result: "Fail", reason: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN);
        req.user = decoded.data;
        next();
    } catch (error) {
        return res.status(401).json({ result: "Fail", reason: "Invalid or Expired Admin Token" });
    }
}

function verifyStaff(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ result: "Fail", reason: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_STAFF);
        req.user = decoded.data;
        next();
    } catch (error) {
        return res.status(401).json({ result: "Fail", reason: "Invalid or Expired Staff Token" });
    }
}

function verifyCustomer(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ result: "Fail", reason: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_CUSTOMER);
        req.user = decoded.data;
        next();
    } catch (error) {
        return res.status(401).json({ result: "Fail", reason: "Invalid or Expired Customer Token" });
    }
}

// Allows Admin or Staff
function verifyBoth(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ result: "Fail", reason: "Access Denied: No Token Provided" });
    }

    const keys = [
        process.env.JWT_SECRET_KEY_ADMIN,
        process.env.JWT_SECRET_KEY_STAFF,
    ].filter(Boolean);

    for (const key of keys) {
        try {
            const decoded = jwt.verify(token, key);
            req.user = decoded.data;
            return next();
        } catch (err) {
            // Try next secret
        }
    }

    return res.status(401).json({ result: "Fail", reason: "Invalid or Expired Token" });
}

// Allows Admin, Staff, or Customer
function verifyThree(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ result: "Fail", reason: "Access Denied: No Token Provided" });
    }

    const keys = [
        process.env.JWT_SECRET_KEY_ADMIN,
        process.env.JWT_SECRET_KEY_STAFF,
        process.env.JWT_SECRET_KEY_CUSTOMER,
    ].filter(Boolean);

    for (const key of keys) {
        try {
            const decoded = jwt.verify(token, key);
            req.user = decoded.data;
            return next();
        } catch (err) {
            // Try next secret
        }
    }

    return res.status(401).json({ result: "Fail", reason: "Invalid or Expired Token" });
}

module.exports = {
    extractToken,
    verifyAdmin,
    verifyStaff,
    verifyCustomer,
    verifyBoth,
    verifyThree,
};
