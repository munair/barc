// load required public modules.
let express = require('express');
// loaded required public modules.

// load required rest api module.
const makerestapirequest = require('./modules/makerestapirequest');
// load required rest api module.

// load router.
var router = express.Router(mergeParams=true);
// loaded router.

// middleware for retrieving instruments.
const buildinstrumentdatatablemiddleware = async function buildinstrumentstable( req, res, next ) {
  
  // retrieve parameters specific in the url.
  let bitmexaccount = res.locals.bitmexaccounts[0];
  // retrieved parameters specific in the url.

  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let instrument = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument/', {
	  'filter': { 'state': 'Open' },
	  'count': 500
  });
  // made requests.

  req.instrumentdata = instrument; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving instruments.

/* GET Instruments Page. */
router.get('/', buildinstrumentdatatablemiddleware, function(req, res, next) { res.render('instruments', { 'instrumentdata': req.instrumentdata, }); });

module.exports = router;
