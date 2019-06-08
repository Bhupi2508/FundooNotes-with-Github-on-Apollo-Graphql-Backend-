var client = require('./elastic');
client.count({index: 'data',type: 'constituencies'},function(err,resp,status) {  
    console.log("constituencies",resp);
  });