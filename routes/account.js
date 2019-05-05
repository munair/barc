var express = require('express');
var router = express.Router(mergeParams=true);

/* Open position on BitMex Account */
router.get('/:accountid/order/:contracts/require/:return', function(req, res) {
  res.send(req.params);
});

module.exports = router;
