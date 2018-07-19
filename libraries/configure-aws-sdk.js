const AWS = require('aws-sdk');
const PropertiesReader = require('properties-reader');

if (process.env.NODE_ENV === 'production') {
  AWS.config.update({
    region: 'us-east-2',
    credentials: new AWS.ECSCredentials()
  });
  console.log(AWS.config);
} else {
  const creds = PropertiesReader('/run/secrets/aws-administrator-credentials');
  AWS.config.update({
    region: 'us-east-2',
    accessKeyId: creds.get('default.aws_access_key_id'),
    secretAccessKey: creds.get('default.aws_secret_access_key'),
  });
}
