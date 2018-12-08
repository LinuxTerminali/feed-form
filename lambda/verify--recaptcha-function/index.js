const fetch = require('node-fetch');
exports.handler = async(event, context) => {
    try {
        var user_data = { 'key': event['queryStringParameters']['key'], 'token': event['queryStringParameters']['token'], "remoteip": event['headers']['X-Forwarded-For'] };
        var response = {
            "isBase64Encoded": false,
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: 400,
            body: JSON.stringify(user_data),
        };
        let data = await getDataFromGoogle(user_data);
        response["statusCode"] = 200;
        response['body'] = JSON.stringify(data);
        return response;

    }
    catch (err) {
        response['body'] = JSON.stringify(err);
        return response;
    }


};

async function getDataFromGoogle(user_data) {
    let response = await fetch("https://www.google.com/recaptcha/api/siteverify?secret=" + user_data["key"] + "&response=" + user_data['token'] + "&remoteip=" + user_data["remoteip"]);
    let data = await response.json();
    return data;
}
