document.addEventListener('DOMContentLoaded', function ( event ) {
  async function refreshpositionsummaryprices( event ) {
  
    // define consts.
    const websocketserver = 'wss://www.bitmex.com/realtime';
    const socket = new WebSocket( websocketserver );
    // defined key static (const) variables.

    // handle socket.
    socket.onopen = ( event ) => { socket.send( '{"op": "subscribe", "args": ["instrument"]}' ) }
    socket.onerror = ( event ) => { console.log( 'received: %s', event.data ) }
    socket.onclose = ( event ) => { console.log( 'turn socket connection indicator red.', event.data ) }
    socket.onmessage = ( event ) => { 
      let jsondata = JSON.parse( event.data );
      if ( jsondata.info ) { console.log( jsondata.info ); }
      if ( jsondata.limit ) { console.log( 'Connections remaining limited to: ' + jsondata.limit.remaining ); }
      if ( jsondata.success ) { console.log( 'Socket connected: ' + jsondata.success ); }
      console.log ( jsondata.data )
      if ( jsondata.data ) {
        for ( let i = 0 ; i < jsondata.data.length ; i++ ) { 
          let bitmexaccount = document.getElementById('accountid').innerText
          let orderquantity; if ( document.getElementById(jsondata.data[i].symbol + '-currentquantity') ) {
            orderquantity = Number(document.getElementById(jsondata.data[i].symbol + '-currentquantity').innerText)
	  } 
          if ( jsondata.data[i].lastPrice && document.getElementById(jsondata.data[i].symbol + '-lastprice') ) { 
            document.getElementById(jsondata.data[i].symbol + '-lastprice').innerHTML = jsondata.data[i].lastPrice 
	  }
          if ( jsondata.data[i].askPrice && document.getElementById(jsondata.data[i].symbol + '-askprice') ) { 
            document.getElementById(jsondata.data[i].symbol + '-askprice').innerHTML = jsondata.data[i].askPrice 
            if ( orderquantity > 0 ) {
              let orderHTML = 
                '<a href="/postorders/' + bitmexaccount + 
                '/ordertype/Limit/orderprice/' + jsondata.data[i].askPrice + 
                '/orderquantity/' + Number(-1 * orderquantity) + 
                '/financialinstrument/' + jsondata.data[i].symbol + 
                '/executioninstructions/ParticipateDoNotInitiate">' + orderquantity
                '</a>'
              document.getElementById(jsondata.data[i].symbol + '-currentquantity').innerHTML = orderHTML
	    }
	  }
          if ( jsondata.data[i].bidPrice && document.getElementById(jsondata.data[i].symbol + '-bidprice') ) { 
            document.getElementById(jsondata.data[i].symbol + '-bidprice').innerHTML = jsondata.data[i].bidPrice 
            if ( orderquantity < 0 ) {
              let orderHTML = 
                '<a href="/postorders/' + bitmexaccount + 
                '/ordertype/Limit/orderprice/' + jsondata.data[i].bidPrice + 
                '/orderquantity/' + Number(-1 * orderquantity) + 
                '/financialinstrument/' + jsondata.data[i].symbol + 
                '/executioninstructions/ParticipateDoNotInitiate">' + orderquantity
                '</a>'
              document.getElementById(jsondata.data[i].symbol + '-currentquantity').innerHTML = orderHTML
	    }
            if ( orderquantity === 0 ) {
              let orderHTML = 
                '<a href="/postorders/' + bitmexaccount + 
                '/ordertype/Limit/orderprice/' + jsondata.data[i].bidPrice + 
                '/orderquantity/1000/financialinstrument/' + jsondata.data[i].symbol + 
                '/executioninstructions/ParticipateDoNotInitiate">' + orderquantity
                '</a>'
              document.getElementById(jsondata.data[i].symbol + '-currentquantity').innerHTML = orderHTML
	    }
	  }
        }
      }
    }
    // handled socket.
 
  };
  
  refreshpositionsummaryprices(); /* run refreshpositionsummaryprices after the DOM loads */
});
