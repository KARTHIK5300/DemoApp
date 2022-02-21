const express = require('express');
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');
const opn = require('open');
const app = express();
const url = require('url')
const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const PORT = process.env.PORT ||3000;

// if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
//     throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.')
// }

//===========================================================================//
//  HUBSPOT APP CONFIGURATION
//
//  All the following values must match configuration settings in your app.
//  They will be used to build the OAuth URL, which users visit to begin
//  installing. If they don't match your app's configuration, users will
//  see an error page.

// Replace the following with the values from your app auth config, 
// or set them as environment variables before running.
const CLIENT_ID = '5a875d01-6d6d-47c1-b88d-b87624928708';
const CLIENT_SECRET = 'c845124e-f510-4f57-a947-a558d3148b4b';

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = ['crm.objects.contacts.read'];
if (process.env.SCOPE) {
    SCOPES = (process.env.SCOPE.split(/ |, ?|%20/)).join(' ');
}

// On successful install, users will be redirected to /oauth-callback
const REDIRECT_URI = `https://beststealdeals.herokuapp.com/oauth-callback`;

//===========================================================================//

// Use a session to keep track of client ID
app.use(session({
  secret: Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: true
}));
 
//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1
// Build the authorization URL to redirect a user
// to when they choose to install the app
const outreachAuth = `
https://api.outreach.io/oauth/authorize?client_id=tAkDQFJ4G7_mJyzbO9bg9LswGAvx4rhZVrRDAMvXrqM
&redirect_uri=https://www.indiumsoftware.com/oauth/outreach/&response_type=code&scope=prospects.all%20webhooks.all`
const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=oauth%20integration-sync%20tickets%20crm.objects.contacts.read%20crm.objects.contacts.write%20crm.schemas.custom.read` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page
console.log(authUrl)
// Redirect the user from the installation page to
// the authorization URL
app.get('/install', (req, res) => {
  console.log('');
  console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
  console.log('');
  console.log("===> Step 1: Redirecting user to your app's OAuth URL");
  res.redirect(authUrl);
  console.log('===> Step 2: User is being prompted for consent by HubSpot');
});
app.get('/outreachauth', (req, res) => {
  console.log('');
  console.log('=== Initiating OAuth 2.0 flow with outreachauth ===');
  console.log('');
  console.log("===> Step 1: Redirecting user to your app's OAuth URL");
  res.redirect(outreachAuth);

  console.log("===> Step 1: Redirecting user to your app's OAuth URL")
  if (req.query.code) {
    console.log('       > Received an authorization token');
    res.redirect(REDIRECT_URI);
  }
  console.log('===> Step 2: User is being prompted for consent by outreachauth');
});


// Step 2
// The user is prompted to give the app access to the requested
// resources. This is all done by HubSpot, so no work is necessary
// on the app's end

// Step 3
// Receive the authorization code from the OAuth 2.0 Server,
// and process it based on the query parameters that are passed
app.get('/test', (req, res) => {
  const userId = req.query.userId || "22";
  const portalId = req.query.portalId || "33";
  console.log(userId,portalId)
  accessTokenCache.set("userData", {userId:userId,portalId:portalId});
  console.log(  accessTokenCache.getStats())
  console.log(accessTokenCache.get("userData"))
  res.json({
    "responseVersion": "v3",
    "cardLabel": "Tickets",
    "allItemsLinkUrl": "https://example.com/all-items-link-url",
    "totalCount": 1,
    "topLevelActions": {
    "secondary": [
    {
    "type": "IFRAME",
    "width": 640,
    "height": 480,
    "url": "https://beststealdeals.herokuapp.com",
    "label": "test_label_secondary",
    "propertyNamesIncluded": []
    }
    ],
    "settings": {
    "propertyNamesIncluded": [
    "some_crm_property"
    ],
    "width": 640,
    "label": "Edit",
    "type": "IFRAME",
    "url": "https://beststealdeals.herokuapp.com",
    "height": 480
    },
    "primary": {
    "propertyNamesIncluded": [],
    "width": 640,
    "label": "test_label_primary",
    "type": "IFRAME",
    "url": "https://beststealdeals.herokuapp.com",
    "height": 480
    }
    },
    "sections": [
    {
    "id": "123",
    "title": "API-22: APIs working too fast",
    "linkUrl": "http://example.com/1",
    "tokens": [
    {
    "name": "created",
    "label": "test_label",
    "dataType": "DATE",
    "value": "2016-08-04"
    }
    ],
    "actions": [
    {
    "type": "ACTION_HOOK",
    "httpMethod": "POST",
    "url": "https://example.com/action-hook-frame",
    "label": "action-hook-label",
    "propertyNamesIncluded": [
    "email",
    "firstName"
    ]
    },
    {
    "type": "ACTION_HOOK",
    "confirmation": {
    "prompt": "action-confirmation-body-prompt",
    "confirmButtonLabel": "Continue",
    "cancelButtonLabel": "Cancel"
    },
    "httpMethod": "POST",
    "url": "https://example.com/confirmation-action-hook",
    "label": "confirmation-hook-label",
    "propertyNamesIncluded": []
    },
    {
    "type": "IFRAME",
    "width": 640,
    "height": 480,
    "url": "https://example.com/iframe-action-label",
    "label": "iframe-action-label",
    "propertyNamesIncluded": [
    "property1",
    "property2",
    "property3"
    ]
    }
    ]
    }
    ]
    })
})

app.get('/oauth-callback', async (req, res) => {
  console.log('===> Step 3: Handling the request sent by the server');

  // Received a user authorization code, so now combine that with the other
  // required values and exchange both for an access token and a refresh token
  if (req.query.code) {
    console.log('       > Received an authorization token');

    const authCodeProof = {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code
    };

    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }

    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(`/`);
  }
});

//==========================================//
//   Exchanging Proof for an Access Token   //
//==========================================//

const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof
    });
    // Usually, this token data should be persisted in a database and associated with
    // a user identity.
    const tokens = JSON.parse(responseBody);
    refreshTokenStore[userId] = tokens.refresh_token;
    accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
    return JSON.parse(e.response.body);
  }
};

const refreshAccessToken = async (userId) => {
  const refreshTokenProof = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshTokenStore[userId]
  };
  return await exchangeForTokens(userId, refreshTokenProof);
};

const getAccessToken = async (userId) => {
  // If the access token has expired, retrieve
  // a new one using the refresh token
  if (!accessTokenCache.get(userId)) {
    console.log('Refreshing expired access token');
    await refreshAccessToken(userId);
  }
  return accessTokenCache.get(userId);
};

const isAuthorized = (userId) => {
  return refreshTokenStore[userId] ? true : false;
};

//====================================================//
//   Using an Access Token to Query the HubSpot API   //
//====================================================//

const getContact = async (accessToken) => {
  console.log('');
  console.log('=== Retrieving a contact from HubSpot using the access token ===');
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    console.log('===> Replace the following request.get() to test other API calls');
    console.log('===> request.get(\'https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1\')');
    const result = await request.get('https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1', {
      headers: headers
    });

    return JSON.parse(result).contacts[0];
  } catch (e) {
    console.error('  > Unable to retrieve contact');
    return JSON.parse(e.response.body);
  }
};

//========================================//
//   Displaying information to the user   //
//========================================//

const displayContactName = (res, contact) => {
  if (contact.status === 'error') {
    res.write(`<p>Unable to retrieve contact! Error Message: ${contact.message}</p>`);
    return;
  }
  const { firstname, lastname } = contact.properties;
  res.write(`<p>Contact name: ${firstname.value} ${lastname.value}</p>`);
};

app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h2>HubSpot OAuth 2.0 Quickstart App</h2>`);
  if (isAuthorized(req.sessionID)) {
    const accessToken = await getAccessToken(req.sessionID);
    const contact = await getContact(accessToken);
    res.write(`<h4>Access token: ${accessToken}</h4>`);
    displayContactName(res, contact);
    var userData = ""
    if (accessTokenCache.get("userData")) {
      console.log("getting data")
      userData = accessTokenCache.get("userData")
    }
    res.write(`<h4>portalId: ${JSON.stringify(userData)}</h4>`);
  } else {
    res.write(`<a href="/install"><h3>Install the app</h3></a>`);
    res.write(`<a href="/outreachauth"><h3>Outreach Auth</h3></a>`)
  }
  res.end();
});

app.get('/error', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h4>Error: ${req.query.msg}</h4>`);
  res.end();
});


app.listen(PORT,console.log(`Server started on port ${PORT}`));
