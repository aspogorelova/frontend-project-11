export default (data, linkFeed) => {
  const parser = new DOMParser();
  try {
    const parserData = parser.parseFromString(data.contents, 'application/xml');
    const parserError = parserData.querySelector('parsererror');
    console.log('parser error  ', parserError);
    if (parserError) {
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
  
    return { title, items };
  } catch (e) {
    throw e;
  }
  };
