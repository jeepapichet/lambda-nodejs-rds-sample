// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const { Client } = require("pg");
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
 
const SecretsManager = require('./secretsManager.js');
 
exports.lambdaHandler = async (event, context) => {
    
    var region = process.env.AWS_REGION;
    var secretName = process.env.RDS_SECRETS_NAME;
    var secretValue = await SecretsManager.getSecret(secretName, region);
    // console.log(secretName);
    // console.log(region);
    // console.log("this is secrets: " + secretValue);

    const secretValue_json = JSON.parse(secretValue);
    var db_host = secretValue_json['host'];
    var db_name = secretValue_json['dbname'];
    var db_port = secretValue_json['port'];
    var db_username = secretValue_json['username'];
    var db_password = secretValue_json['password'];
    //console.log(db_host + db_port + db_name  + db_username + db_password); 
    
    // const client = new Client({
    //   host: "mysqlforlambdatest2.c7bphfch4bsd.ap-southeast-1.rds.amazonaws.com",
    //   database: "ExampleDB2",
    //   user: "master",
    //   password: "AWSDemo123!"
    // });
    
    const client = new Client({
      host: db_host,
      database: db_name,
      user: db_username,
      password: db_password
    });
    
    await client.connect();
    const res = await client.query("SELECT * from employees ORDER BY hire_date DESC LIMIT 5;");

    const data = res.rows;
    console.log('last 5 hires');
    data.forEach(row => {
        console.log(`EmpId: ${row.emp_no} Name: ${row.first_name} ${row.last_name} Hire Date: ${row.hire_date}`);
    })
        
    await client.end();
    
    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
