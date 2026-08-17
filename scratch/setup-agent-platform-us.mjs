import { execSync } from 'child_process';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim().split('\n').pop().trim();
const projectId = 'gen-lang-client-0540208645';
const location = 'us';
const dataStoreId = 'pocketgull-clinical-docs';
const engineId = 'pocketgull-assistant';

async function createDataStoreUS() {
  const url = `https://us-discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores?dataStoreId=${dataStoreId}`;
  console.log(`Creating Data Store [${dataStoreId}] in location [${location}]...`);
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
  console.log('Create Data Store US Result:', JSON.stringify(data, null, 2));
  return data;
}

async function importDocumentsUS() {
  const url = `https://us-discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/branches/0/documents:import`;
  console.log(`Importing documents into [${dataStoreId}] in [${location}]...`);
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
  console.log('Import Documents US Result:', JSON.stringify(data, null, 2));
  return data;
}

async function createEngineUS() {
  const url = `https://us-discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/engines?engineId=${engineId}`;
  console.log(`Creating Engine [${engineId}] in location [${location}]...`);
  const body = {
    displayName: "Pocket Gull Medical Intelligence Assistant",
    solutionType: "SOLUTION_TYPE_SEARCH",
    dataStoreIds: [dataStoreId],
    searchEngineConfig: {
      searchTier: "SEARCH_TIER_STANDARD",
      searchAddOns: ["SEARCH_ADD_ON_LLM"]
    }
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
  console.log('Create Engine US Result:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  await createDataStoreUS();
  await new Promise(r => setTimeout(r, 2000));
  await importDocumentsUS();
  await new Promise(r => setTimeout(r, 2000));
  await createEngineUS();
}

main();
