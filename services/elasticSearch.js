const { Client } = require('elasticsearch');
const client = new Client({
  host: 'localhost:4000'
});

const main = async () => {
  const health = await client.cluster.health();
  console.log(health)
}

main()