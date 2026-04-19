import fetch from 'node-fetch';

const url = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Shimen_Reservoir_20201121_04.jpg";

async function check() {
  const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
  const res = await fetch(wsrvUrl, { method: 'HEAD' });
  console.log(res.status, wsrvUrl);
}

check();
