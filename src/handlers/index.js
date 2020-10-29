/**
 * A Lambda function that returns a static string
 */
exports.handler = async () => {
    // If you change this message, you will need to change hello-from-lambda.test.js
    const message = process.env['SAMPLE_VALUE'];

    // All log statements are written to CloudWatch
    console.info(`${message}`);
    
    return message;
}