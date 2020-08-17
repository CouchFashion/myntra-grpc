const nodemailer = require('nodemailer');
let {getMail} = require("./templates");
//TO-DO edit email Id
const emailFrom = '"CouchFashion Tech Team" <tech@couchfashion.com>';
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  //TO-DO UPDATE CREDENTIALS
  auth: {
    user: 'tech@couchfashion.com',
    pass: 'S6zXzq7bH1Cb'
  }
});

const sendMail = async function(targetEmails, subject, body){
  return transporter.sendMail({
    from: emailFrom,
    to: targetEmails, //comma seperated string of emails Ex: "a@a.com, b@a.com, c@a.com"
    subject: subject,
    html: getMail("cid:nyan@example.com", body),
    attachments: [
      // File Stream attachment
      {
        filename: 'logo.png',
        path: __dirname + '/logo.png',
        cid: 'nyan@example.com' // should be as unique as possible
      }
    ]
  });
}

module.exports = {sendMail}