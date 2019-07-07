// load required public modules.
let express = require('express');
// loaded required public modules.

// load required rest api module.
const makerestapirequest = require('./modules/makerestapirequest');
// load required rest api module.

// load router.
var router = express.Router(mergeParams=true);
// loaded router.

// middleware for open instrument information.
const buildinstrumenttablemiddleware = async function buildinstrumenttable( req, res, next ) {
  
  // retrieve parameters specific in the url.
  let symbol = req.params.symbol;
  let bitmexaccount = res.locals.bitmexaccounts[0];
  // retrieved parameters specific in the url.
   
  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let instrument = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument/', { 'symbol': symbol } );
  // made requests.

  req.instrumentdata = instrument[0]; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Open instrument on BitMex Account */
router.get( '/:symbol', buildinstrumenttablemiddleware, (req, res, next)  => { res.render('instrument', { 'instrumentdata': req.instrumentdata, 'parameterdata': req.params } ); });

module.exports = router;
