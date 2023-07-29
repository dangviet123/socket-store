
const nodeMailer = require('nodemailer')

const adminEmail = 'hoadon@meraplion.com'
const adminPassword = 'HD@Meraplion'
const mailHost = 'mail.meraplion.com'
const mailPort = 465
const sendMail = (to, subject, htmlContent) => {

  const transporter = nodeMailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: true,
    auth: {
      user: adminEmail,
      pass: adminPassword
    }
  })
  const options = {
    from: adminEmail, // địa chỉ admin email bạn dùng để gửi
    to: to, // địa chỉ gửi đến
    subject: subject, // Tiêu đề của mail
    html: htmlContent // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
  }
  return transporter.sendMail(options)
}

sendMail('vietdq@meraplion.com', 'IT TEST SEND EMAIL', 'IT TEST SEND EMAIL');