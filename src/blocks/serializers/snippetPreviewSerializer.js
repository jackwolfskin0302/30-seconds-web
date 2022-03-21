export const snippetPreviewSerializer = {
  name: 'SnippetPreviewSerializer',
  methods: {
    description: snippet => snippet.descriptionHtml.trim(),
    searchTokens: (snippet, { withSearch } = {}) =>
      withSearch ? snippet.searchTokens : undefined,
    searchResultTag: (snippet, { withSearch } = {}) =>
      withSearch ? snippet.formattedMiniPreviewTag : undefined,
    previewTitle: (snippet, { withSearch }) => {
      if (!withSearch) return undefined;
      return snippet.shortTitle;
    },
  },
  attributes: [
    'title',
    'shortTitle',
    ['slug', 'url'],
    'icon',
    'description',
    ['formattedPreviewTags', 'tags'],
    'searchTokens',
    'searchResultTag',
    'expertise',
  ],
};
