// load required modules.
let fs = require('fs');
let express = require('express');
// loaded required modules.

let router = express.Router();

// use middleware for retrieving account balances.
const buildallroutesmiddleware = async function buildallroutes( req, res, next ) {
  
  // define consts.
  const accountfiledata = fs.readFileSync('bitmexaccounts.json');
  const bitmexaccounts = JSON.parse(accountfiledata);
  // defined key static (const) variables.

  req.accountlist = bitmexaccounts; /* storing data to be used by the request handler in the Request.locals object */
  res.locals.bitmexaccounts = bitmexaccounts; /* storing data to be used by all routes to the response.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* all GET/POST/PUT/etc. pages. */
router.use(buildallroutesmiddleware, (req, res, next) => { 
    res.locals.bitmexaccounts = req.accountlist;
    next();
});

module.exports = router;
