// load required public modules.
let qs = require('qs');
let crypto = require('crypto');
let express = require('express');
let fetch = require('node-fetch');
// loaded required public modules.

// load required rest api module.
const makerestapirequest = require('./modules/makerestapirequest');
// load required rest api module.

// load router.
let router = express.Router();
// loaded router.

// use middleware for retrieving account balances.
const buildaccountbalancestablemiddleware = async function buildaccountbalancestable( req, res, next ) {
  
  let totalxbtbalance = 0;
  let accountbalance = new Object();
  let availablemargin = new Object();
  let bitmexaccounts = req.accountlist;
   
  for ( let index in bitmexaccounts ) {
    // set key and secret according to account.
    let key = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_KEY");
    let secret = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
    // set key and secret according to account.
    
    // make requests.
    let user = await makerestapirequest ( key, secret, 'GET', '/api/v1/user/' );
    let margin = await makerestapirequest ( key, secret, 'GET', '/api/v1/user/margin' );
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
  let instrument = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument/' );
  let filteredinstrument = instrument.filter(contract => contract.symbol === 'XBTUSD');
  let usdperxbt = filteredinstrument[0].lastPrice;
  // retrieved present exchange rate.

  for ( let index in bitmexaccounts ) { // update the account balances object with relative balance information.
    satoshirisked = Number( accountbalance[index][1] - availablemargin[index][1] );
    dollarsrisked = Number( ( accountbalance[index][1] - availablemargin[index][1] ) * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString();
    percentagerisked = Number( 100 * ( 1 - availablemargin[index][1] / accountbalance[index][1] ) ).toFixed(2);

    relativebalance =  Number( 100 * accountbalance[index][1] / totalxbtbalance ).toFixed(2);
    dollarbalance =  Number( accountbalance[index][1] * Number(usdperxbt) * 0.00000001 ).toFixed(2).toLocaleString();

    accountbalance[index].push( Number( +relativebalance || 0 ).toFixed(2) + '%' );
    accountbalance[index].push( Number( +dollarbalance || 0 ).toFixed(2).toLocaleString() );

    availablemargin[index].push( Number( +satoshirisked || 0 ) );
    availablemargin[index].push( Number( +dollarsrisked || 0 ).toFixed(2).toLocaleString() );
    availablemargin[index].push( Number( +percentagerisked || 0 ).toFixed(2) + '%' );
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
router.get('/', buildaccountbalancestablemiddleware, (req, res, next) => { 
  res.render('index', {
    'accountbalancedata': req.balancedata, 
    'availablemargindata': req.margindata, 
    'totalusdbalance': req.totalusdbalance
  }); 
});

module.exports = router;
