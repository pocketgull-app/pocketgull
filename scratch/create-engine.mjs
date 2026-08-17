import { execSync } from 'child_process';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim().split('\n').pop().trim();
const projectId = 'gen-lang-client-0540208645';
const location = 'global';
const engineId = 'pocketgull-assistant';
const dataStoreId = 'pocketgull-clinical-docs';

async function createEngine() {
  const url = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/engines?engineId=${engineId}`;
  console.log(`Creating Engine [${engineId}] in ${projectId}...`);
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
  console.log('Create Engine Result:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  await createEngine();
}

main();
