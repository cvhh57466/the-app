import fetch from 'node-fetch';

async function run() {
  const res = await fetch('https://api.github.com/repos/cvhh57466/the-app/commits');
  const data = await res.json() as any;
  if (Array.isArray(data)) {
    for(let i = 0; i < Math.min(3, data.length); i++) {
        console.log(`Commit: ${data[i].commit.message} by ${data[i].commit.author.name}`);
    }
  } else {
    console.log("Error:", data);
  }
}
run();
