const config = require('../config');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(config.googleApi.clientId);

const verifyIdToken = async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.googleApi.clientId,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    console.log(ticket);
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return payload;
  };


module.exports = verifyIdToken;