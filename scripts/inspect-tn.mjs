import { readFileSync } from 'fs';
const envVars = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) envVars[m[1].trim()] = m[2].trim();
}
const TN_STORE_ID = envVars['TIENDANUBE_STORE_ID'];
const TN_ACCESS_TOKEN = envVars['TIENDANUBE_ACCESS_TOKEN'];
const res = await fetch(`https://api.tiendanube.com/v1/${TN_STORE_ID}/products?per_page=5`, {
  headers: {
    Authentication: `bearer ${TN_ACCESS_TOKEN}`,
    'User-Agent': 'Mazoteca AppId/28885',
  }
});
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
