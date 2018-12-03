const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
/**
 * JWT 토큰 생성
 * @param {any} payload
 * @returns {string} token
 */
function generateToken(payload) {
    return new Promise(
        (resolve, reject) => {
            jwt.sign(
                payload,
                jwtSecret,
                {
                    expiresIn: '7d'
                }, (error, token) => {
                    if (error) reject(error);
                    resolve(token);
                }
            );
        }
    );
}
exports.generateToken = generateToken;

function decodeToken(token) {
    return new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error, decoded) => {
                if (error) reject(error);
                resolve(decoded);
            });
        }
    );
}
exports.decodeToken = decodeToken;

exports.jwtMiddleware = async (req,res, next) => {
    const token = req.cookies['access_token']; // req 에서 access_token 을 읽어옵니다
    if (!token) return next(); // 토큰이 없으면 바로 다음 작업을 진행합니다.

    try {
        const decoded = await decodeToken(token); // 토큰을 디코딩 합니다

        // 토큰 만료일이 하루밖에 안남으면 토큰을 재발급합니다
        if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
            // 하루가 지나면 갱신해준다.
            const { id, profile } = decoded;
            const freshToken = await generateToken({ id, profile }, 'account');
            res.cookie('access_token',freshToken,{
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
                httpOnly: true
            });
        }

        // req.user 에 디코딩된 값을 넣어줍니다
        req.user = decoded;
    } catch (e) {
    // token validate 실패
        req.user = null;
    }

    return next();
};
