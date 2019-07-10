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
let router = express.Router(mergeParams=true);
// loaded router.

// middleware for account information.
const buildaccountinformationtablemiddleware = async function buildaccountinformationtable( req, res, next ) {
  
  // define variables.
  let bitmexaccount = req.params.bitmexaccount;
  let endpoint = req.params.informationrequired.replace("-","/");
  let openpositions = new Object;
  // defined variables.
   
  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let information = await makerestapirequest ( key, secret, 'GET', '/api/v1/' + endpoint + '/' );
  let instrument = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument/', {
    'filter': { 'state': 'Open' },
    'count': 500
  });
  let filteredinstrument = instrument.filter(contract => contract.symbol === 'XBTUSD');
  let usdperxbt = filteredinstrument[0].lastPrice;
  // made requests.

  let position = await makerestapirequest ( key, secret, 'GET', '/api/v1/position/', { 'filter': { 'isOpen': true } });
  for ( let i = 0 ; i < instrument.length ; i++ ) {
    let filteredposition = position.filter(contract => contract.symbol === instrument[i].symbol);
    if ( filteredposition[0] )
      openpositions[i] = { 
        'symbol': filteredposition[0].symbol, 
        'currentQty': filteredposition[0].currentQty, 
        'lastPrice': filteredposition[0].lastPrice,
        'askPrice': instrument[i].askPrice, 
        'bidPrice': instrument[i].bidPrice 
      }
    else
      openpositions[i] = { 
        'symbol': instrument[i].symbol, 
        'currentQty': 0, 
        'lastPrice': 0,
        'askPrice': 0,
        'bidPrice': 0
      }
  }

  req.endpoint = endpoint; /* storing data to be used by the request handler in the Request.locals object */
  req.usdperxbt = usdperxbt; /* storing data to be used by the request handler in the Request.locals object */
  req.requesteddata = information; /* storing data to be used by the request handler in the Request.locals object */
  req.bitmexaccount = bitmexaccount; /* storing data to be used by the request handler in the Request.locals object */
  req.openpositions = openpositions; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Retrieve Endpoint information on the BitMex Account Specified */
router.get( '/:bitmexaccount/endpoint/:informationrequired', buildaccountinformationtablemiddleware, (req, res, next)  => {
  res.render('accountinformation', { 
    'endpoint': req.endpoint,
    'usdperxbt': req.usdperxbt,
    'requesteddata': req.requesteddata, 
    'bitmexaccount': req.bitmexaccount, 
    'openpositions': req.openpositions
  } )
});

/* Redirect Endpoint and BitMex Account */
router.post( '/', (req, res, next)  => {
  res.redirect( '/accountinformation/' + req.body.bitmexaccount + '/endpoint/' + req.body.informationrequired )
});

module.exports = router;
