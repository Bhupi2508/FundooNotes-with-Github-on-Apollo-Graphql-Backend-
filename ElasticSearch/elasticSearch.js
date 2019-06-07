var client = require('./elastic');

client.cluster.health({},function(err,resp,status) {  
  console.log("-- Client Health --",resp);
});