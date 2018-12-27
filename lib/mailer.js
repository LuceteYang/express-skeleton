/**
 * Created by sanghwan on 2018. 12. 2.
 */
const nodemailer = require('nodemailer');
const { exec } = require('child_process');

const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: true, // use SSL
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
});
const sendMail = (receiverMails, title, text, html) => new Promise(
    (resolve, reject) => {
        const mailOptions = {
            from: process.env.MAILER_USER, // sender address
            to: receiverMails, // list of receivers
            subject: title, // Subject line
            text, // plaintext body
            html
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(null);
        });
    }
);

exports.serverStart = () => new Promise(
    (resolve, reject) => {
        exec('git log --pretty=format:"%h" -1', (err, stdout) => {
            if (err) {
                //not exist .git file 
                stdout="gitVersion"
                //return reject(err);
            }
            const d = new Date();
            const processName = process.env.NAME;
            const title = `${processName} start ${stdout} ${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}시${d.getMinutes()}분${d.getSeconds()}초 `;
            const html = `<div>${title}</div>`;
            sendMail(process.env.MANAGER_MAIL, title, '', html)
                .then(() => {
                    resolve();
                })
                .catch((e) => {
                    reject(e);
                });
        });
    }
);
