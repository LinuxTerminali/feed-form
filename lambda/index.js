const aws = require('aws-sdk');
const s3 = new aws.S3();
var crypto = require('crypto');
exports.handler = async (event, context) => {
    try {
        let user_data = JSON.parse(event.body);
        var response_data = {
            "upload": false
        }
        var response = {
            "isBase64Encoded": false,
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: 400,
            body: JSON.stringify(response_data),
        };
        if (user_data.hasOwnProperty('first') && user_data.hasOwnProperty("last") && user_data.hasOwnProperty("email")) {
            user_data["ip"] = event['headers']['X-Forwarded-For']
            user_data["user-agent"] = event['headers']['User-Agent']
            let file = await emailHash(user_data['email'])
            file = file + ".json"
            var params = {
                Bucket: 'feed-form',
                Key: file,
            };
            //params['Expires'] = 60 * 5;
            let test = await testFile(params);
            if (!test.hasOwnProperty('code')) {
                params["Body"] = JSON.stringify(user_data);
                response_data["error"] = "Email Already Exist"
                response["statusCode"] = 403;
                response['body'] = JSON.stringify(response_data)
                return response
            } else {
                params["Body"] = JSON.stringify(user_data);
                let s3upload = await s3.upload(params).promise()
                if (s3upload.hasOwnProperty('Location')) {
                    delete params["Body"]
                    params['Expires'] = 60 * 5;
                    const url = s3.getSignedUrl('getObject', params)
                    response_data = {
                        "upload": true,
                        "url": url
                    }
                    response['body'] = JSON.stringify(response_data)
                    response["statusCode"] = 200;
                    return response;
                }
            }



        } else {
            response_data["error"] = "Invalid params"
            return response;
        }
    } catch (err) {
        response_data["error"] = err

        return response;
    }


};


async function emailHash(email) {
    var hash = await crypto.createHash('md5').update(email).digest('hex');
    return hash;
}

async function testFile(params) {
    try {
        var s3getFile = await s3.headObject(params).promise();
        s3getFile.then(function (data) {
            return data;
        }).catch(function (err) {
            return err
        });
    } catch (err) {
        return err
    }



}