export default (data, linkFeed) => {
  console.log('START PARSER');
  const parser = new DOMParser();
  const parserData = parser.parseFromString(data.contents, 'application/xml');
  console.log('parserData  ', parserData);
  const parserError = parserData.querySelector('parsererror');
  if (parserError) {
    throw new Error('noRss');
  } else {
    const titleFeed = parserData.querySelector('title').textContent;
    const descriptionFeed = parserData.querySelector('description').textContent;
    const feed = { titleFeed, descriptionFeed, linkFeed };
    console.log('FEED  ', feed);

    const posts = Array.from(parserData.querySelectorAll('item'))
      .map((post) => {
        const titlePost = post.querySelector('title').textContent;
        const descriptionPost = post.querySelector('description').textContent;
        const linkPost = post.querySelector('link').textContent;
        return { titlePost, descriptionPost, linkPost };
      });

    return { feed, posts };
  }
};
