import pathSettings from 'settings/paths';

export const repository = {
  name: 'Repository',
  fields: [
    { name: 'name', type: 'stringRequired' },
    { name: 'dirName', type: 'stringRequired' },
    { name: 'repoUrl', type: 'stringRequired' },
    { name: 'snippetPath', type: 'stringRequired' },
    { name: 'slug', type: 'stringRequired' },
    { name: 'isBlog', type: 'booleanRequired', defaultValue: false },
    { name: 'featured', type: 'booleanRequired' },
    { name: 'icon', type: 'string' },
    { name: 'splash', type: 'stringRequired' },
    { name: 'description', type: 'stringRequired' },
    { name: 'shortDescription', type: 'stringRequired' },
    {
      name: 'biasPenaltyMultiplier',
      type: 'numberRequired',
      defaultValue: 1.0,
      validators: {
        min: 1.0,
      },
    },
    { name: 'imagesName', type: 'string' },
    { name: 'imagesPath', type: 'string' },
  ],
  properties: {
    sourceDir: repo => `${repo.dirName}/${repo.snippetPath}`,
    slugPrefix: repo => `${repo.slug}/s`,
    repoUrlPrefix: repo => `${repo.repoUrl}/blob/master/${repo.snippetPath}`,
    vscodeUrlPrefix: repo =>
      `${pathSettings.rawContentPath}/sources/${repo.sourceDir}`,
    isCSS: repo => repo.id === '30css',
    isReact: repo => repo.id === '30react',
  },
  lazyProperties: {
    listing: ({ models: { Listing } }) => repo => {
      const type = repo.isBlog ? 'blog' : 'language';
      const listingId = `${type}/${repo.slug}`;
      return Listing.records.get(listingId);
    },
  },
  cacheProperties: ['isCSS', 'isReact', 'listing'],
  scopes: {
    css: repo => repo.isCSS,
    react: repo => repo.isReact,
    blog: repo => repo.isBlog,
    withImages: repo => repo.imagesName && repo.imagesPath,
  },
};
