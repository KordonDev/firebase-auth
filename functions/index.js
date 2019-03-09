const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors')({
    origin: true,
});

const serviceAccount = require('./serviceAccount.json');
const invitedUsers = require('./passwd.json').users;

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://my-awesome-marriage.firebaseio.com'
});

exports.authenticationRequest = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        const loginCode = req.query.loginCode;
        console.log(`Authentication requested with loginCode ${loginCode}`);

        const user = invitedUsers.find(invitation => invitation.loginCode === loginCode);
        if (user) {
            const firebaseTokenInfo = {
                name: user.name,
            };
            firebaseAdmin.auth().createCustomToken(user.key, firebaseTokenInfo)
                .then(customToken => res.json(customToken))
                .catch(error => {
                    console.error('No customToken', error);
                    res.status(401).send('No customToken');
                });
                return;
        }
        console.error(`Failed login for ${loginCode}`)
        res.status(401).send('Not authorized');
    });
});
