// This is a server-only config, use module.exports to make things easier
module.exports = {
  assetPath: `assets`,
  contentPath: `./content`,
  templatesPath: `./src/components/templates`,
  templates: [
    {
      name: `SnippetPage`,
      path: `snippetPage/index.jsx`,
    },
    {
      name: `SearchPage`,
      path: `searchPage/index.jsx`,
    },
    {
      name: `ListingPage`,
      path: `listingPage/index.jsx`,
    },
    {
      name: `NotFoundPage`,
      path: `notFoundPage/index.jsx`,
    },
    {
      name: `StaticPage`,
      path: `staticPage/index.jsx`,
    },
    {
      name: `SettingsPage`,
      path: `settingsPage/index.jsx`,
    },
  ],
}
;
