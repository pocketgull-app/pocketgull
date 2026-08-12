async function checkJobDetails() {
  const jobsRes = await fetch('https://api.github.com/repos/philgear/pocketgull/actions/runs/31412236398/jobs', {
    headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'Node-Fetch' }
  });
  const jobsData = await jobsRes.json();
  const e2eJob = (jobsData.jobs || []).find(j => j.name === 'test-e2e');
  if (e2eJob) {
    console.log('E2E Job Name:', e2eJob.name);
    console.log('E2E Job Status:', e2eJob.status);
    console.log('E2E Job Conclusion:', e2eJob.conclusion);
    console.log('Steps:');
    for (const s of e2eJob.steps) {
      console.log(` - ${s.name}: ${s.conclusion} (started: ${s.started_at}, completed: ${s.completed_at})`);
    }
  }
}

checkJobDetails();
