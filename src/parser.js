export default (data, linkFeed) => {
  const parser = new DOMParser();
  try {
    data.then((contentData) => {
      const parserData = parser.parseFromString(contentData.contents, 'application/xml');
      const parserError = parserData.querySelector('parsererror');
      if (parserError !== null) {
        throw new Error('noRss');
      }
    const titleFeed = parserData.querySelector('title').textContent;
    const descriptionFeed = parserData.querySelector('description').textContent;
    const title = { titleFeed, descriptionFeed, linkFeed };
  
    const items = Array.from(parserData.querySelectorAll('item'))
      .map((post) => {
        const titlePost = post.querySelector('title').textContent;
        const descriptionPost = post.querySelector('description').textContent;
        const linkPost = post.querySelector('link').textContent;
        return { titlePost, descriptionPost, linkPost };
      });
  
      console.log('result parser  ', { title, items });
    return { title, items };
    });
  } catch (e) {
    console.log('error in parser  ', e);
    throw e;
  }
  };
