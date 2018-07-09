const AWS = require('aws-sdk');
const PropertiesReader = require('properties-reader');

// in production, configuration is handled for us by ECS, so we only need to configure in dev
if (process.env !== 'production') {
  const creds = PropertiesReader('/run/secrets/aws-administrator-credentials');
  AWS.config.update({
    region: 'us-east-2',
    accessKeyId: creds.get('default.aws_access_key_id'),
    secretAccessKey: creds.get('default.aws_secret_access_key'),
  });
}
