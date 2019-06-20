// load required modules.
let fs = require('fs');
let qs = require('qs');
let crypto = require('crypto');
let express = require('express');
let fetch = require('node-fetch');
// loaded required modules.

let router = express.Router();

// use middleware for retrieving open positions.
const buildpositiondatatablemiddleware = async function buildaccountbalancestable( req, res, next ) {
  
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

  let totalxbtexposed = 0;
  let totalusdexposed = 0;
  let summarytablecount = 0;
  let openpositionsummary = new Object();
   
  for ( let index in bitmexaccounts ) {
    // set key and secret according to account.
    let key = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_KEY");
    let secret = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
    // set key and secret according to account.
    
    // make requests.
    let user = await restapirequest ( key, secret, 'GET', '/api/v1/user/' );
    let position = await restapirequest ( key, secret, 'GET', '/api/v1/position' );
    let instrument = await restapirequest ( key, secret, 'GET', '/api/v1/instrument/' );
    // made requests.

    // retrieve present exchange rate.
    let filteredinstrument = instrument.filter(contract => contract.symbol === 'XBTUSD');
    let usdperxbt = filteredinstrument[0].lastPrice;
    // retrieved present exchange rate.
  
    // filter open positions.
    let openposition = position.filter(status => status.isOpen === true);
    // filtered open positions.

    for ( let positions in openposition ) { // update total exposure.
      totalxbtexposed += Math.abs( +openposition[positions].currentCost ) * +openposition[positions].initMarginReq;
    } // updated total exposure.

    // determine total usd balance.
    totalusdexposed = Number( totalxbtexposed * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString();
    // determined total usd balance.
    
    for ( let positions in openposition ) { // create summary table.
      summarytablecount += 1;
      openpositionsummary[summarytablecount] = [
	user.username,
	openposition[positions].symbol,
        openposition[positions].lastPrice + ' ' + openposition[positions].quoteCurrency,
	openposition[positions].currentQty,
        Number( Math.abs( +openposition[positions].currentCost ) * +openposition[positions].initMarginReq * +usdperxbt * 0.00000001 ).toFixed(2).toLocaleString() + ' USD',
        Number( ( +openposition[positions].lastPrice / +openposition[positions].markPrice ) * +openposition[positions].unrealisedRoePcnt * 100 ).toFixed(2) + '%',
        Number( ( +openposition[positions].lastPrice / +openposition[positions].markPrice ) * +openposition[positions].unrealisedPnl * +usdperxbt * 0.00000001 ).toFixed(2).toLocaleString() + ' USD',
      ]
    } // updated total exposure.
	  
  }
  
  // total the returns of each open position.
  let totalusdreturn = 0; for ( let index in openpositionsummary ) { totalusdreturn += +openpositionsummary[index][6].slice(0, -4); } totalusdreturn = totalusdreturn.toFixed(2).toLocaleString()
  // totalled the returns of each open position.

  // calculate the relative returns of each open position.
  for ( let index in openpositionsummary ) { openpositionsummary[index].push( Number( 100 * +openpositionsummary[index][4].slice(0, -4) / +totalusdexposed ).toFixed(2) + '%' ) }
  // calculated the relative returns of each open position.

  req.positiondata = openpositionsummary; /* storing data to be used by the request handler in the Request.locals object */
  req.totalusdexposed = totalusdexposed; /* storing data to be used by the request handler in the Request.locals object */
  req.totalusdreturn = totalusdreturn; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving open positions.
  
/* GET Positions Page. */
router.get('/', buildpositiondatatablemiddleware, function(req, res, next) { res.render('positions', {
    'openpositiondata': req.positiondata, 
    'totalusdexposed': req.totalusdexposed,
    'totalusdreturn': req.totalusdreturn
  }); 
});

module.exports = router;
