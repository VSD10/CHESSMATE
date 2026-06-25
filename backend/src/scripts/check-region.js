const https = require('https');

https.get('https://ip-ranges.amazonaws.com/ip-ranges.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const matches = json.ipv6_prefixes.filter(p => {
        // Match the prefix 2406:da1a:314
        return p.ipv6_prefix.startsWith('2406:da1a:');
      });
      console.log('Matches found for 2406:da1a:');
      console.log(JSON.stringify(matches, null, 2));
    } catch (e) {
      console.error(e);
    }
  });
});
