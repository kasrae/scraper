const aws = require("aws-sdk");
const kms = new aws.KMS({'region': 'us-east-1'});

var decrypt = async function(buffer) {

    let params = {
        CiphertextBlob: new Buffer.from(buffer, "base64")
    };
    
    let unsecret;

    try {
        const decrypted = await kms.decrypt(params).promise();
        unsecret = decrypted.Plaintext.toString('utf-8');
    } catch(error) {
        console.error("[AWS-KMS-Service] Unable to decrypt buffer - ", + JSON.stringify(error));
    }

    return unsecret;
};

var encrypt = async function(properties, obj) {

    let params = {
        KeyId: properties.kmsKey,
        Plaintext: obj
    };
    
    let secret;

    try {
        const encrypted = await kms.encrypt(params).promise();
        secret = encrypted.CiphertextBlob.toString('base64');
    } catch(error) {
        console.error("[AWS-KMS-Service] Unable to decrypt buffer - ", + JSON.stringify(error));
    }

    return secret;
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;