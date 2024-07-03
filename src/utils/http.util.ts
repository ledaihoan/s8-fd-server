export const getRequestPath = function (url) {
  // If the URL is absolute, return it as the request path
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new URL(url).pathname;
  }

  // Otherwise, return the URL as is (it is assumed to be relative)
  return url.startsWith('/') ? url : `/${url}`;
};
