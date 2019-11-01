/**
 * Given a snippet object with key-value pairs, removes all
 * unnecessary information that should not be sent to the JSX
 * component rendering the snippet.
 */
const parseSnippetContext = (snippet, cardTemplate) => {
  let templateProps = {};
  switch (cardTemplate) {
  case 'css':
    templateProps = {
      browserSupport: snippet.browserSupport,
    };
    break;
  default:
    templateProps = {
    };
    break;
  }
  return {
    id: snippet.id,
    title: snippet.title,
    // TODO: Figure out a better solution for the description
    description: snippet.text.short,
    url: snippet.url,
    expertise: snippet.expertise,
    language: snippet.language,
    tags: snippet.tags,
    html: snippet.html,
    code: snippet.code,
    ...templateProps,
  };
};

export default parseSnippetContext;
