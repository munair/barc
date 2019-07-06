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
const buildpostordersmiddleware = async function buildpostorders( req, res, next ) {
  
  let ordertype = req.params.ordertype;
  let orderprice = req.params.orderprice;
  let orderquantity = req.params.orderquantity;
  let bitmexaccount = req.params.bitmexaccount;
  let financialinstrument = req.params.financialinstrument;
  let executioninstructions = req.params.executioninstructions;
  let orderinstructions = { 'symbol': financialinstrument, 'orderQty': orderquantity, 'price': orderprice, 'ordType': ordertype, 'execInst': executioninstructions }
   
  // make requests.
  let key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY");
  let secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
  let orderinformation = await makerestapirequest ( key, secret, 'POST', '/api/v1/order', orderinstructions );
  // made requests.

  req.bitmexaccount = bitmexaccount; /* storing data to be used by the request handler in the Request.locals object */
  req.orderinformation = orderinformation; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Retrieve Endpoint information on the BitMex Account Specified */
router.get( 
  '/:bitmexaccount/ordertype/:ordertype/orderprice/:orderprice/orderquantity/:orderquantity/financialinstrument/:financialinstrument/executioninstructions/:executioninstructions', 
  buildpostordersmiddleware, 
  (req, res, next)  => {
    res.render('postorders', { 
      'account': req.bitmexaccount, 
      'orderinformation': req.orderinformation
    } )
  }
);

/* Redirect Endpoint and BitMex Account */
router.post( '/', (req, res, next)  => {
  res.redirect( 
    '/postorders/' + req.body.bitmexaccount + 
    '/ordertype/' + req.body.ordertype + 
    '/orderprice/' + req.body.orderprice + 
    '/orderquantity/' + req.body.orderquantity + 
    '/financialinstrument/' + req.body.financialinstrument + 
    '/executioninstructions/' + req.body.executioninstructions
  )
});

module.exports = router;
