// load required modules.
let fs = require('fs');
let qs = require('qs');
let crypto = require('crypto');
let express = require('express');
let fetch = require('node-fetch');
// loaded required modules.

let router = express.Router();

// use middleware for retrieving account balances.
const buildaccountbalancestablemiddleware = async function buildaccountbalancestable( req, res, next ) {
  
  // define consts.
  const accountfiledata = fs.readFileSync('bitmexaccounts.json');
  const bitmexaccounts = JSON.parse(accountfiledata);
  const restapiserver = 'https://www.bitmex.com';
  // defined key static (const) variables.

  async function restapirequest ( key, secret, method, requestpath, requestparameters ) { // make rest api request.
   
    // set expiration to 1 min in the future. this code uses the 'expires' scheme.
    let expires = Math.round(new Date().getTime() / 1000) + 60;

    // create prehash.
    let getquery = '';
    let postbody = '';
    if ( method === 'GET' ) { query = '?' + qs.stringify(requestparameters); } else { postbody = JSON.stringify(requestparameters); }
    let prehash = method + requestpath + getquery + expires + postbody;
    // created prehash.

    // sign request.
    // documentation from BitMex: Pre-compute the post's body so we can be sure that we're using *exactly* the same body in the request
    // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
    let signature = crypto.createHmac( 'sha256', secret ).update( prehash ).digest( 'hex' );
    // signed request.

    // define required headers.
    let headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-expires': expires,
      'api-key': key,
      'api-signature': signature
    };
    // defined required headers.
  
    // define request options for http request.
    let requestoptions = { 'method': method, headers };
    if ( method !== 'GET' ) { requestoptions['body'] = postbody; }
    // defined request options for http request.
  
    // define url and send request.
    let url = restapiserver + requestpath;
    let response = await fetch(url,requestoptions);
    let json = await response.json();
    // defined url and sent request.
  
    return json;
  
  } // made rest api request.

  let totalxbtbalance = 0;
  let accountbalance = new Object();
  let availablemargin = new Object();
   
  for ( let index in bitmexaccounts ) {
    // set key and secret according to account.
    let key = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_KEY");
    let secret = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
    // set key and secret according to account.
    
    // make requests.
    let user = await restapirequest ( key, secret, 'GET', '/api/v1/user/' );
    let margin = await restapirequest ( key, secret, 'GET', '/api/v1/user/margin' );
    // made requests.

    // update total and account balance object.
    totalxbtbalance += margin.walletBalance;
    accountbalance[index] = [ user.username, margin.walletBalance ];
    availablemargin[index] = [ user.username, margin.availableMargin ];
    // updated total and account balance object.
  }
  
  // retrieve present exchange rate.
  let key = eval("process.env." + bitmexaccounts[0].toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccounts[0].toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let instrument = await restapirequest ( key, secret, 'GET', '/api/v1/instrument/' );
  let filteredinstrument = instrument.filter(contract => contract.symbol === 'XBTUSD');
  let usdperxbt = filteredinstrument[0].lastPrice;
  // retrieved present exchange rate.

  for ( let index in bitmexaccounts ) { // update the account balances object with relative balance information.
    accountbalance[index].push( Number( 100 * accountbalance[index][1] / totalxbtbalance ).toFixed(2) );
    accountbalance[index].push( Number( accountbalance[index][1] * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString() );
    availablemargin[index].push( Number( availablemargin[index][1] * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString() );
  } // updated the account balances object with relative balance information.

  // determine total usd balance.
  let totalusdbalance = Number( totalxbtbalance * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString();
  // determined total usd balance.
  
  req.balancedata = accountbalance; /* storing data to be used by the request handler in the Request.locals object */
  req.margindata = availablemargin; /* storing data to be used by the request handler in the Request.locals object */
  req.totalusdbalance = totalusdbalance; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* GET home page. */
router.get('/', buildaccountbalancestablemiddleware, function(req, res, next) { res.render('index', {
    accountbalancedata: req.balancedata, 
    availablemargindata: req.margindata, 
    totalusdbalance: req.totalusdbalance
  }); 
});

module.exports = router;
