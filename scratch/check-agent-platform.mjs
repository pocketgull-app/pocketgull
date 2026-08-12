import { execSync } from 'child_process';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim().split('\n').pop().trim();
const projectId = 'gen-lang-client-0540208645';

async function listDataStores(location) {
  const url = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores`;
  console.log(`\nQuerying Data Stores in location [${location}] for project ${projectId}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Goog-User-Project': projectId,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(`Data Stores (${location}):`, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error(`Error querying ${location}:`, err);
  }
}

async function listEngines(location) {
  const url = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/engines`;
  console.log(`\nQuerying Engines (Apps) in location [${location}] for project ${projectId}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Goog-User-Project': projectId,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(`Engines (${location}):`, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error(`Error querying engines ${location}:`, err);
  }
}

async function main() {
  await listDataStores('global');
  await listDataStores('us');
  await listEngines('global');
  await listEngines('us');
}

main();
