async function testWiki() {
  const titles = ['Xpark 水族館', '華泰名品城', '大溪老街', '石門水庫', '中平故事館'];
  for (const t of titles) {
    const res = await fetch(`https://zh.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(t)}`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
      console.log(t, pages[pageId].original.source);
    } else {
      console.log(t, 'Not found');
    }
  }
}

testWiki();
