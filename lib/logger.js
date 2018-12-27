/**
 * Created by sanghwan on 2018. 12. 2..
 */
const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');

const colors = {
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
};
const transports = [
    new (winston.transports.Console)({
        format: winston.format.combine(
            winston.format.printf((info) => {
                let res = JSON.stringify(info);
                if (info.message === 'res') {
                    let statusCode = info.status;
                    if (statusCode === 200 || statusCode === 304) {
                        statusCode = colors.green + statusCode + colors.reset;
                    } else if (statusCode === 404) {
                        statusCode = colors.yellow + statusCode + colors.reset;
                    } else {
                        statusCode = colors.red + statusCode + colors.reset;
                    }
 
                    printString = `${statusCode} - ${`${colors.cyan}${info.method}${colors.reset}`} - ${`${colors.green}${info.url}${colors.reset}`}  `
                    + `${info.user &&`/ user : ${info.user}`}  `
                    + `${info.ip &&`/ ip : ${info.ip}`}  `
                    + `${info.responsetime &&`/ responsetime : ${info.responsetime}`}  `
                    + `${info.timestamp &&`/ timestamp : ${info.timestamp}`}  `
                    + `${info.message &&`/ ${info.message}`}  `;
                }
                return res;
            })
        )
    })
];

if (process.env.NODE_ENV === 'production') {
    transports.push(new (winston.transports.DailyRotateFile)({
        filename: `./${process.env.name || 'devApiServer'}_%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        dirname: `${__dirname}/../logs`
    }));
}

const logger = winston.createLogger({
    transports
});
const token = require('./token');

let notLogParamList;
if (process.env.NODE_ENV === 'production') {
    notLogParamList = ['pw', 'lat', 'lon', 'si', 'gu', 'dong', 'old-pw', 'new-pw'];
} else {
    notLogParamList = [];
}
function getParamFuc(req) {
    let param = {};
    if (req.method === 'GET') {
        param = req.query;
    } else if (req.method === 'POST') {
        param = req.body;
    }
    const copy = JSON.parse(JSON.stringify(param));
    for (let keys = Object.keys(copy), i = 0, end = keys.length; i < end; i++) {
        const key = keys[i];
        if (notLogParamList.indexOf(key) !== -1) {
            delete copy[key];
        }
    }
    return copy;
}
function getIpFunc(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.replace(/^.*:/, '')
    return ip;
};

exports.info = function (...msg) {
    logger.info('info', { msg });
};
exports.error = function (...msg) {
    msg = msg.map(item=>{
        if(item instanceof Error){
            return item.message;
        }
        return item;
    })
    logger.error(msg);
};

exports.fileParamlog = function (url, userId, param) {
    logger.info('req', {
        method: 'POST', user: userId, url, param: JSON.stringify(param)
    });
};
const responseLog = function (req,res) {
    logger.info('res', {
        method: req.method,
        status: res.statusCode,
        user: req.tokenInfo.id,
        url: req.url,
        timestamp: req.timestamp,
        responsetime: `${new Date() - req.start} ms`,
        ip: getIpFunc(req),
        st: req.reqId
    });
};
exports.responseLog = responseLog;
const requestLog = function (req) {
    logger.info('req', {
        method: req.method,
        user: req.tokenInfo.id,
        url: req.url,
        timestamp: req.timestamp,
        param: getParamFuc(req),
        st: req.reqId
    });
};
exports.requestLog = requestLog;

exports.logMiddleWare = async (req,res, next) => {
    req.tokenInfo = { id: 'none' };
    if (req.cookies['access_token']) {
        try {
            req.tokenInfo = await token.decodeToken(req.cookies['access_token']);
        } catch (e) {}
    }
    const start = new Date();
    req.start = start;
    req.reqId = moment(start).format('YYYYMMDDHHmmss');
    req.timestamp = moment(start).format('YYYY.MM.DD HH:mm:ss');
    requestLog(req);
    res.on("finish", () => {
        responseLog(req,res);
    });
    next();
};
