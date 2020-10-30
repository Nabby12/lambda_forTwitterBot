
const twitter = require('twitter');

const twitter_client = new twitter({
    consumer_key        : process.env['API_KEY'],
    consumer_secret     : process.env['API_KEY_SECRET'],
    access_token_key    : process.env['ACCESS_TOKEN'],
    access_token_secret : process.env['ACCESS_TOKEN_SECRET'],
});

exports.handler = async () => {
    // If you change this message, you will need to change hello-from-lambda.test.js
    const message = process.env['TWITTER_API_KEY_SECRET'];

    // All log statements are written to CloudWatch
    console.info(`${message}`);
    
    return message;
}
