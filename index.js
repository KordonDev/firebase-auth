const express = require('express');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');

const serviceAccount = require('./serviceAccount.json');
const invitedUsers = require('./passwd.json').users;

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://marriage-test.firebaseio.com/'
});

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.get('/', function (req, res, next) {
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
                res.sendStatus(401);
            });
            return;
    }
    console.error(`Failed login for ${loginCode}`)
    res.sendStatus(401);
});

app.listen(8080);