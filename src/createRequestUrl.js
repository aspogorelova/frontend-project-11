export default createRequestUrl = (url) => {
  const baseUrl = new URL('https://allorigins.hexlet.app/get')
  baseUrl.searchParams.set('disableCache', 'true')
  baseUrl.searchParams.set('url', `${url}`)
  return String(baseUrl.href);
}
