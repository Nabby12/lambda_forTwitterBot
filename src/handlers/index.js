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
const TWITTER_MAX_LENGTH = 140;

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
let TABLE_NAME = process.env['DYNAMO_TABLE_NAME'];

exports.handler = async () => {
    const contents = await getContents();

    const postContent = contents.post;
    const params = { status: postContent };

    let tweet_id = '';
    await twitter_client.post('statuses/update', params).then(tweet => {
        console.log('投稿に成功しました。');
        tweet_id = tweet.id_str;
    }).catch(err => {
        console.log(err);
    });

    if (tweet_id !== '') {
        const replyContent = contents.reply;
        const replyParams = { 
            status: replyContent, 
            in_reply_to_status_id: tweet_id
        };
        await twitter_client.post('statuses/update', replyParams).then(() => {
            console.log('スレッド投稿に成功しました。');
        }).catch(err => {
            console.log(err);
        });
    };
}

async function getContents () {
    let records = await getUnPostFlagRecords();
    if (records.Count === 0) {
        records = await initRecords(records.ScannedCount);
    };

    let max = records.Count;
    let random = Math.floor(Math.random() * max);
    
    let diary_id_array = [ records.Items[random].diary_id ];
    let eng_phrase = records.Items[random].eng_phrase;
    let jan_phrase = records.Items[random].jan_phrase;
    
    let flg = false;
    let pre_get_id_array = [];
    records.Items.some(record => {
        pre_get_id_array.push(record.diary_id)
        if (eng_phrase.length <= TWITTER_MAX_LENGTH && jan_phrase.length <= TWITTER_MAX_LENGTH) {
            flg = true;
            return true;
        } else {
            random = Math.floor(Math.random() * max);
            pre_get_id_array.some(preGetId => {
                if (random !== preGetId) {
                    return true;
                } else {
                    random = Math.floor(Math.random() * max);
                };
            });

            diary_id_array.push(records.Items[random].diary_id);
            eng_phrase = records.Items[random].eng_phrase;
            jan_phrase = records.Items[random].jan_phrase;
        }
    });
    
    if (!flg) {
        records = await initRecords(records.ScannedCount);
        diary_id_array = [];
        random = Math.floor(Math.random() * records.Count);
        
        diary_id_array = [ records.Items[random].diary_id ];
        eng_phrase = records.Items[random].eng_phrase;
        jan_phrase = records.Items[random].jan_phrase;

        pre_get_id_array = [];
        records.Items.some(() => {
            if (eng_phrase.length <= TWITTER_MAX_LENGTH && jan_phrase.length <= TWITTER_MAX_LENGTH) {
                flg = true;
                return true;
            } else {
                random = Math.floor(Math.random() * max);
                pre_get_id_array.some(preGetId => {
                    if (random !== preGetId) {
                        return true;
                    } else {
                        random = Math.floor(Math.random() * max);
                    };
                });

                diary_id_array.push(records.Items[random].diary_id);
                eng_phrase = records.Items[random].eng_phrase;
                jan_phrase = records.Items[random].jan_phrase;
            }
        });
    };

    await Promise.all(diary_id_array.map(async diary_id => await putPostFlag(diary_id, 1)));

    const contents = {
        'post': eng_phrase,
        'reply': jan_phrase
    };
    return contents;
};

async function getUnPostFlagRecords() {
    let unPostFlagRecords = [];

    let scanParams = {
        TableName: TABLE_NAME,
        FilterExpression: 'post_flg = :unPostFlg',
        ExpressionAttributeValues: {
            ':unPostFlg' : 0
        },
    };
    await dynamo.scan(scanParams).promise().then(data => {
        unPostFlagRecords = data;
    }).catch(err => {
        console.log(err);
    });

    if (unPostFlagRecords.Count === 0) {
        unPostFlagRecords = await initRecords(unPostFlagRecords.ScannedCount);   
    };

    return unPostFlagRecords;
};

async function initRecords(max){
    let diary_id_array = [];
    for (let i = 1; i <= max; i++) {
        diary_id_array.push(i);
    };

    await Promise.all(diary_id_array.map(async diary_id => await putPostFlag(diary_id, 0)));

    let initRecords = [];
    let scanParams = {
        TableName: TABLE_NAME,
        FilterExpression: 'post_flg = :unPostFlg',
        ExpressionAttributeValues: {
            ':unPostFlg' : 0
        },
    };
    await dynamo.scan(scanParams).promise().then(data => {
        initRecords = data;
    }).catch(err => {
        console.log(err);
    });

    return initRecords;
};

async function putPostFlag(diary_id, postFlg){
    let updateItem = {
        diary_id: diary_id,
    };
    let updateParams = {
        TableName: TABLE_NAME,
        Key: updateItem,
        UpdateExpression: "set post_flg=:postFlg",
        ExpressionAttributeValues:{
            ":postFlg": postFlg,
        },
        ReturnValues:"UPDATED_NEW"
    };
    await dynamo.update(updateParams).promise().then(() => {
    }).catch(err => {
        console.log(err);
    });
};