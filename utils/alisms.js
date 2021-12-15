
// npm i  @alicloud/sms-sdk
const SMSClient = require('@alicloud/sms-sdk')
 
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'yourAccessKeyId'
const secretAccessKey = 'yourAccessKeySecret'
 
let smsClient = new SMSClient({accessKeyId, secretAccessKey});

export default smsClient;