
// npm i  @alicloud/sms-sdk
const SMSClient = require('@alicloud/sms-sdk')
 
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAI5tJpYFw8vXAF1wfpt7GW'
const secretAccessKey = 'ps3dn1Ye4p1YCM3QBZpwhTK33l1iJv'
 
let smsClient = new SMSClient({accessKeyId, secretAccessKey});

module.exports =  smsClient;