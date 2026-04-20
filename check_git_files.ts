import fetch from 'node-fetch';

async function run() {
  const res = await fetch('https://api.github.com/repos/cvhh57466/the-app/commits');
  const commits = await res.json() as any;
  if (!Array.isArray(commits)) return console.log(commits);
  
  for (let i=0; i<Math.min(5, commits.length); i++) {
    const sha = commits[i].sha;
    const msg = commits[i].commit.message;
    console.log("COMMIT:", msg);
    
    // Get commit details to see file changes
    const detailRes = await fetch(`https://api.github.com/repos/cvhh57466/the-app/commits/${sha}`);
    const details = await detailRes.json() as any;
    if (details.files) {
       for (const f of details.files) {
          console.log(`  - ${f.status}: ${f.filename}`);
       }
    }
  }
}
run();
