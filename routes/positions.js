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

// use middleware for retrieving open positions.
const buildpositiondatatablemiddleware = async function buildaccountbalancestable( req, res, next ) {
  
  // define variables.
  let totalxbtexposed = 0;
  let totalusdexposed = 0;
  let summarytablecount = 0;
  let instrumentsummary = new Array();
  let openpositionsummary = new Object();
  let bitmexaccounts = res.locals.bitmexaccounts;
  // defined variables.
   
  for ( let index in bitmexaccounts ) {
    // set key and secret according to account.
    let key = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_KEY");
    let secret = eval("process.env." + bitmexaccounts[index].toUpperCase() + "_USEFULCOIN_COM_API_SECRET");
    // set key and secret according to account.
    
    // make requests.
    let user = await makerestapirequest ( key, secret, 'GET', '/api/v1/user/' );
    let position = await makerestapirequest ( key, secret, 'GET', '/api/v1/position' );
    let instrument = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument/' );
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
      instrumentsummary[summarytablecount] = [openposition[positions].symbol];
      openpositionsummary[summarytablecount] = [
	user.username,
	openposition[positions].symbol,
        openposition[positions].lastPrice + ' ' + openposition[positions].quoteCurrency,
	openposition[positions].currentQty,
        Number( Math.abs( +openposition[positions].currentCost ) * +openposition[positions].initMarginReq * +usdperxbt * 0.00000001 ).toFixed(2).toLocaleString() + ' USD',
        Number( ( +openposition[positions].lastPrice / +openposition[positions].markPrice ) * +openposition[positions].unrealisedRoePcnt * 100 ).toFixed(2) + '%',
        Number( ( +openposition[positions].lastPrice / +openposition[positions].markPrice ) * +openposition[positions].unrealisedPnl * +usdperxbt * 0.00000001 ).toFixed(2).toLocaleString() + ' USD',
      ]
      summarytablecount += 1;
    } // updated total exposure.
	  
  }
  
  // total the returns of each open position.
  let totalusdreturn = 0; for ( let index in openpositionsummary ) { totalusdreturn += +openpositionsummary[index][6].slice(0, -4); } totalusdreturn = totalusdreturn.toFixed(2).toLocaleString()
  // totalled the returns of each open position.

  // calculate the relative returns of each open position.
  for ( let index in openpositionsummary ) { openpositionsummary[index].push( Number( 100 * +openpositionsummary[index][4].slice(0, -4) / +totalusdexposed ).toFixed(2) + '%' ) }
  // calculated the relative returns of each open position.

  req.instrumentdata = instrumentsummary; /* storing data to be used by the request handler in the Request.locals object */
  req.positiondata = openpositionsummary; /* storing data to be used by the request handler in the Request.locals object */
  req.totalusdexposed = totalusdexposed; /* storing data to be used by the request handler in the Request.locals object */
  req.totalusdreturn = totalusdreturn; /* storing data to be used by the request handler in the Request.locals object */
  next(); /* called at the end of the middleware function to pass the execution to the next handler, unless we want to prematurely end the response and send it back to the client */
};
// use middleware for retrieving open positions.
  
/* GET Positions Page. */
router.get('/', buildpositiondatatablemiddleware, function(req, res, next) { res.render('positions', {
    'instrumentsummary': req.instrumentdata, 
    'openpositiondata': req.positiondata, 
    'totalusdexposed': req.totalusdexposed,
    'totalusdreturn': req.totalusdreturn
  }); 
});

module.exports = router;
