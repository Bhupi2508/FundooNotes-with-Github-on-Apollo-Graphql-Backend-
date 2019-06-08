var client = require('./elastic');

client.delete({  
  index: 'data',
  id: '1',
  type: 'constituencies'
},function(err,resp,status) {
    console.log(resp);
});