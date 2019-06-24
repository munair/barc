// load required modules.
let qs = require('qs');
let crypto = require('crypto');
let express = require('express');
let fetch = require('node-fetch');
// loaded required modules.

var router = express.Router(mergeParams=true);

// middleware for open instrument information.
const buildinstrumenttablemiddleware = async function buildinstrumenttable( req, res, next ) {
  
  // define consts.
  const restapiserver = 'https://www.bitmex.com';
  // defined key static (const) variables.

  async function restapirequest ( method, requestpath, requestparameters ) { // make rest api request.
   
    // create prehash.
    let getquery = '';
    let postbody = '';
    if ( method === 'GET' ) { query = '?' + qs.stringify(requestparameters); } else { postbody = JSON.stringify(requestparameters); }
    // created prehash.

    // define required headers.
    let headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
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

  let symbol = req.params.symbol;
   
  // make requests.
  let instrument = await restapirequest ( 'GET', '/api/v1/instrument/' );
  // made requests.

  let openinstrument = instrument.filter(status => status.symbol === symbol);

  req.instrumentdata = openinstrument[0]; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving account balances.
  
/* Open instrument on BitMex Account */
router.get( '/:symbol', buildinstrumenttablemiddleware, (req, res, next)  => { res.render('instrument', { 'instrumentdata': req.instrumentdata, 'parameterdata': req.params } ); });

module.exports = router;
