import { execSync } from 'child_process';
import path from 'path';

console.log("🚀 Syncing PocketGull PR Docs to Vertex AI Search GCS Bucket...");
const bucket = "gs://gen-lang-client-0540208645-genaiapp_com/docs/prs";
const localPath = path.resolve(process.cwd(), "docs/study/src/pages/prs");

try {
  // Sync the local PRs to the GCS bucket
  console.log(`Executing: gcloud storage rsync -R ${localPath} ${bucket}`);
  execSync(`gcloud storage rsync -R ${localPath} ${bucket}`, { stdio: 'inherit' });
  console.log("✅ GCS Sync complete!");
  
  console.log("\nTo trigger the Vertex AI Search re-indexing in the Datastore, you can run your existing setup script:");
  console.log("node scratch/setup-agent-platform.mjs");
} catch (error) {
  console.error("❌ Sync failed:", error.message);
  process.exit(1);
}
