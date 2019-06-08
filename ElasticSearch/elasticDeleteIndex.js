var client = require('./elastic');

client.indices.delete({ index: 'data' }, function (err, resp, status) {
    console.log("delete", resp);
});