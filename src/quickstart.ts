import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as readline from 'readline';

const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload'
];
const TOKEN_DIR = `credentials/`;
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content.toString()), getChannel);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export function authorize(credentials: any, callback: (auth: OAuth2Client) => void) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            getNewToken(oAuth2Client, callback);
        } else {
            oAuth2Client.setCredentials(JSON.parse(token.toString()));
            callback(oAuth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client: OAuth2Client, callback: (auth: OAuth2Client) => void) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oauth2Client.getToken(code, (err, token) => {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.setCredentials(token!);
            storeToken(token!);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token: any) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err: any) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export function getChannel(auth: OAuth2Client) {
    const service = google.youtube('v3');
    service.channels.list({
        auth: auth,
        part: ['snippet', 'contentDetails', 'statistics'],
        forUsername: 'GoogleDevelopers',
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const channels = response!.data.items!;
        if (channels.length === 0) {
            console.log('No channel found.');
        } else {
            console.log(
                'This channel\'s ID is %s. Its title is \'%s\', and it has %s views.',
                channels[0].id,
                channels[0]?.snippet?.title,
                channels[0]?.statistics?.viewCount
            );
        }
    });
}
