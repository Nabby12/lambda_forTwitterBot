const twitter = require('twitter');

const TWITTER_API_KEY = process.env['API_KEY']
const TWITTER_API_KEY_SECRET = process.env['API_KEY_SECRET']
const TWITTER_ACCESS_TOKEN = process.env['ACCESS_TOKEN']
const TWITTER_ACCESS_TOKEN_SECRET = process.env['ACCESS_TOKEN_SECRET']

const twitter_client = new twitter({
    consumer_key        : TWITTER_API_KEY,
    consumer_secret     : TWITTER_API_KEY_SECRET,
    access_token_key    : TWITTER_ACCESS_TOKEN,
    access_token_secret : TWITTER_ACCESS_TOKEN_SECRET,
});

exports.handler = () => {
    const postContent = 'test投稿'
    const params = { status: postContent };

    twitter_client.post('statuses/update', params, (error, tweet) => {
        if(error) {
            console.log(error);
            return
        } else {
            console.log('投稿に成功しました。');
        }
    });
}