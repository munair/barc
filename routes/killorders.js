// load required public modules.
let express = require('express');
// loaded required public modules.

// load required rest api module.
const makerestapirequest = require('./modules/makerestapirequest');
// load required rest api module.

// load router.
let router = express.Router(mergeParams=true);
// loaded router.

// middleware for account information.
const buildkillordersmiddleware = async function buildkillorders( req, res, next ) {
  
  let bitmexaccount = req.params.bitmexaccount;
  let orderid = req.params.orderid;
   
  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let orderinformation = await makerestapirequest ( key, secret, 'DELETE', '/api/v1/order', { 'orderID': orderid } );
  // made requests.

  req.bitmexaccount = bitmexaccount; /* storing data to be used by the request handler in the Request.locals object */
  req.orderinformation = orderinformation[0]; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Retrieve Endpoint information on the BitMex Account Specified */
router.get( 
  '/:bitmexaccount/orderid/:orderid', 
  buildkillordersmiddleware, 
  (req, res, next)  => {
    res.render('killorders', { 
      'bitmexaccount': req.bitmexaccount, 
      'orderinformation': req.orderinformation
    } )
  }
);

/* Redirect Endpoint and BitMex Account */
router.post( '/', (req, res, next)  => {
  res.redirect( 
    '/killorders/' + req.body.bitmexaccount + 
    '/orderid/' + req.body.orderid
  )
});

module.exports = router;
