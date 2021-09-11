const nodemailer = require('nodemailer');
const config = require('../config');

/*
let transporter = nodemailer.createTransport({
    host: config.nodemailer.host,
    port: config.nodemailer.port,
    secure: config.nodemailer.secure,
    auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.pass,
    }
});
*/

let transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.pass,
    },
    tls: {
        rejectUnauthorized: false
      }
});

transporter.verify().then(() => {
    console.log('Ready for send emails');
});


module.exports = transporter;