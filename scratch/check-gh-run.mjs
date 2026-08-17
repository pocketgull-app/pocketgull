async function checkRun() {
  const res = await fetch('https://api.github.com/repos/philgear/pocketgull/actions/runs/31412236398', {
    headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'Node-Fetch' }
  });
  const data = await res.json();
  console.log('Run Name:', data.name);
  console.log('Status:', data.status);
  console.log('Conclusion:', data.conclusion);
  console.log('Branch:', data.head_branch);
  console.log('Event:', data.event);
  console.log('HTML URL:', data.html_url);
  console.log('Jobs URL:', data.jobs_url);

  if (data.jobs_url) {
    const jobsRes = await fetch(data.jobs_url, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'Node-Fetch' }
    });
    const jobsData = await jobsRes.json();
    console.log('\n--- JOBS ---');
    for (const job of jobsData.jobs || []) {
      console.log(`\nJob: ${job.name} | Status: ${job.status} | Conclusion: ${job.conclusion}`);
      for (const step of job.steps || []) {
        if (step.conclusion === 'failure') {
          console.log(`  ❌ Failed Step: ${step.name} (Conclusion: ${step.conclusion})`);
        }
      }
    }
  }
}

checkRun();
