import { uniqueId } from "lodash";

export default (data) => {
  console.log('DATA  ', data);
  const parser = new DOMParser();
  const parserData = parser.parseFromString(data.contents, "application/xml");
  console.log('PARSER data  ', parserData);
  const rss = parserData.querySelector('rss');
  console.log('rss  ', rss);
  if (rss === null) {
    throw new Error('noRss');
  } else {
    const titleFeed = parserData.querySelector('title').textContent;
    const descriptionFeed = parserData.querySelector('description').textContent;
    const linkFeed = data.status.url;
    const feed = { titleFeed, descriptionFeed, linkFeed };
    const posts = Array.from(parserData.querySelectorAll('item'))
      .map((post) => {
        const titlePost = post.querySelector('title').textContent;
        const descriptionPost = post.querySelector('description').textContent;
        const linkPost = post.querySelector('link').textContent;
        const idPost = uniqueId('post_');
        return { idPost, titlePost, descriptionPost, linkPost };
      });
  
    
    return { feed, posts }
  }
};