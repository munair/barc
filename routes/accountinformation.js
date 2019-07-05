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
  
  let bitmexaccount = req.params.bitmexaccount;
  let endpoint = req.params.informationrequired.replace("-","/");
   
  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let information = await makerestapirequest ( key, secret, 'GET', '/api/v1/' + endpoint + '/' );
  // made requests.

  req.requesteddata = information; /* storing data to be used by the request handler in the Request.locals object */
  req.bitmexaccount = bitmexaccount; /* storing data to be used by the request handler in the Request.locals object */
  req.endpoint = endpoint; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Retrieve Endpoint information on the BitMex Account Specified */
router.get( '/:bitmexaccount/endpoint/:informationrequired', buildaccountinformationtablemiddleware, (req, res, next)  => {
  res.render('accountinformation', { 
    'requesteddata': req.requesteddata, 
    'account': req.bitmexaccount, 
    'endpoint': req.endpoint
  } )
});

/* Redirect Endpoint and BitMex Account */
router.post( '/', (req, res, next)  => {
  res.redirect( '/accountinformation/' + req.body.bitmexaccount + '/endpoint/' + req.body.informationrequired )
});

module.exports = router;
