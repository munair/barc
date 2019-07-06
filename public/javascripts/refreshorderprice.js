document.addEventListener('DOMContentLoaded', function (event) {
  async function refreshorderprice(event) {
  
    // define consts.
    const websocketserver = 'wss://www.bitmex.com/realtime';
    const socket = new WebSocket( websocketserver );
    // defined key static (const) variables.

    // define variables.
    let financialinstrument = document.getElementById('financialinstrument').value;
    let orderprice = document.getElementById('orderprice').value;
    let orderdirection = document.getElementById('orderdirection').value;
    // defined variables.
  
    // handle socket.
    socket.onopen = (event) => { socket.send('{"op": "subscribe", "args": ["instrument:' + financialinstrument + '"]}') }
    socket.onerror = (event) => { console.log('received: %s', event.data) }
    socket.onclose = (event) => { console.log('turn socket connection indicator red.', event.data) }
    socket.onmessage = (event) => { 
      let jsondata = JSON.parse(event.data);
      if (jsondata.info) { console.log(jsondata.info); }
      if (jsondata.limit) { console.log('Connections remaining limited to: ' + jsondata.limit.remaining); }
      if (jsondata.success) { console.log('Socket connected: ' + jsondata.success); }
      if (jsondata.data) {
        if (jsondata.data[0].bidPrice) {
          if ( orderdirection === 'long' ) document.getElementById('orderprice').value = jsondata.data[0].bidPrice
        }
        if (jsondata.data[0].askPrice) {
          if ( orderdirection === 'short' ) document.getElementById('orderprice').value = jsondata.data[0].askPrice
        }
      }
    }
    // handled socket.
 
  };
  
  refreshorderprice(); /* run refreshorderprice after the DOM loads */
});
