// load required modules.
let ws = require('ws');
let crypto = require('crypto');
let express = require('express');
let fetch = require('node-fetch');
// loaded required modules.

var router = express.Router(mergeParams=true);

// middleware for ordering contracts.
const contractordermiddleware = async function ordercontracts (req, res, next ) {

  // define consts.
  const websocketserver = 'wss://www.bitmex.com/realtime';
  const socket = new ws( websocketserver );
  // defined key static (const) variables.

  // handle socket.
  socket.on( 'open', ( connectedsocket ) => { socket.send('{"op": "subscribe", "args": ["instrument:XBTUSD"]}'); });
  socket.on( 'error', ( errordata ) => { console.log('received: %s', errordata); });
  socket.on( 'close', ( disconnectedsocket ) => { console.log( 'turn socket connection indicator red.' ); });
  socket.on( 'message', ( messagedata ) => { 
    let jsondata = JSON.parse(messagedata); 
    if (jsondata.info) { console.log(jsondata.info); }
    if (jsondata.limit) { console.log('Connections remaining limited to: ' + jsondata.limit.remaining); }
    if (jsondata.success) { console.log('Socket connected: ' + jsondata.success); }
    if (jsondata.data) {
      if (jsondata.data[0].lastPrice) { console.log('last price: ' + jsondata.data[0].lastPrice); req.lastprice = jsondata.data[0].lastPrice; }
      if (jsondata.data[0].askPrice) { console.log('ask price: ' + jsondata.data[0].askPrice); req.askprice = jsondata.data[0].askPrice; }
      if (jsondata.data[0].bidPrice) { console.log('bid price: ' + jsondata.data[0].bidPrice); req.bidprice = jsondata.data[0].bidPrice; }
    }
  });
  // handled socket.

  // move on to the next function.
  next();
};

/* Open position on BitMex Account */
router.get( '/:accountid/order/:contracts/require/:return', contractordermiddleware, function( req, res ) {
  res.render( 'account', { 
    lastprice: req.lastprice,
    askprice: req.askprice,
    bidprice: req.bidprice,
    parameterdata: req.params 
  } );
});

module.exports = router;
