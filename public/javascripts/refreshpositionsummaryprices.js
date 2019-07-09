document.addEventListener('DOMContentLoaded', function (event) {
  async function refreshpositionsummaryprices(event) {
  
    // define consts.
    const websocketserver = 'wss://www.bitmex.com/realtime';
    const socket = new WebSocket( websocketserver );
    // defined key static (const) variables.

    // handle socket.
    socket.onopen = (event) => { socket.send('{"op": "subscribe", "args": ["instrument"]}') }
    socket.onerror = (event) => { console.log('received: %s', event.data) }
    socket.onclose = (event) => { console.log('turn socket connection indicator red.', event.data) }
    socket.onmessage = (event) => { 
      let jsondata = JSON.parse(event.data);
      if (jsondata.info) { console.log(jsondata.info); }
      if (jsondata.limit) { console.log('Connections remaining limited to: ' + jsondata.limit.remaining); }
      if (jsondata.success) { console.log('Socket connected: ' + jsondata.success); }
      console.log(jsondata.data)
      if (jsondata.data) {
        if (jsondata.data[0].lastPrice) { document.getElementById(jsondata.data[0].symbol + '-lastprice').innerHTML = jsondata.data[0].lastPrice }
        if (jsondata.data[0].askPrice) { document.getElementById(jsondata.data[0].symbol + '-askprice').innerHTML = jsondata.data[0].askPrice }
        if (jsondata.data[0].bidPrice) { document.getElementById(jsondata.data[0].symbol + '-bidprice').innerHTML = jsondata.data[0].bidPrice }
      }
    }
    // handled socket.
 
  };
  
  refreshpositionsummaryprices(); /* run refreshpositionsummaryprices after the DOM loads */
});
