const TWITTER_API_KEY = process.env['TWITTER_API_KEY'];
const TWITTER_API_KEY_SECRET = process.env['TWITTER_API_KEY_SECRET'];
const BEARER_TOKEN = process.env['BEARER_TOKEN'];

exports.handler = async () => {
    // If you change this message, you will need to change hello-from-lambda.test.js
    const message = process.env['TWITTER_API_KEY_SECRET'];

    // All log statements are written to CloudWatch
    console.info(`${message}`);
    
    return message;
}
