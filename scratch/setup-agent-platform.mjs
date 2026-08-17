import { execSync } from 'child_process';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim().split('\n').pop().trim();
const projectId = 'gen-lang-client-0540208645';
const location = 'global';
const dataStoreId = 'pocketgull-clinical-docs';

async function createDataStore() {
  const url = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores?dataStoreId=${dataStoreId}`;
  console.log(`Creating Data Store [${dataStoreId}] in ${projectId}...`);
  const body = {
    displayName: "Pocket Gull Clinical Documentation",
    industryVertical: "GENERIC",
    solutionTypes: ["SOLUTION_TYPE_SEARCH"],
    contentConfig: "CONTENT_REQUIRED"
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Goog-User-Project': projectId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log('Create Data Store Result:', JSON.stringify(data, null, 2));
  return data;
}

async function importDocuments() {
  const url = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/branches/0/documents:import`;
  console.log(`Importing documents from GCS bucket into [${dataStoreId}]...`);
  const body = {
    gcsSource: {
      inputUris: ["gs://gen-lang-client-0540208645-genaiapp_com/docs/*"]
    },
    reconciliationMode: "INCREMENTAL"
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Goog-User-Project': projectId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log('Import Documents Result:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  await createDataStore();
  // Wait 3 seconds for LRO / propagation
  await new Promise(r => setTimeout(r, 3000));
  await importDocuments();
}

main();
