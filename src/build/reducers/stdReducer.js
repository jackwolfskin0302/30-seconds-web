import rankSnippet from 'engines/rankingEngine';
import tokenizeSnippet from 'engines/searchIndexingEngine';
import { convertToSeoSlug, uniqueElements } from 'utils';
import { determineExpertiseFromTags } from 'build/transformers';

export default (id, snippetNode, markdownNode) => {
  return {
    id,
    tags: {
      all: snippetNode.attributes.tags,
      primary: snippetNode.attributes.tags[0],
    },
    expertise: determineExpertiseFromTags(snippetNode.attributes.tags),
    title: snippetNode.title,
    code: snippetNode.attributes.codeBlocks,
    slug: `/${snippetNode.slugPrefix}${convertToSeoSlug(markdownNode.fields.slug)}`,
    url: `${snippetNode.repoUrlPrefix}${markdownNode.fields.slug.slice(0, -1)}.md`,
    path: markdownNode.fileAbsolutePath,
    text: {
      full: snippetNode.attributes.text,
      short: snippetNode.attributes.text.slice(0, snippetNode.attributes.text.indexOf('\n\n')),
    },
    language: {
      ...snippetNode.language,
      otherLanguages: snippetNode.otherLanguages ? snippetNode.otherLanguages : undefined,
    },
    icon: snippetNode.icon,
    ranking: rankSnippet(snippetNode),
    firstSeen: new Date(+`${snippetNode.meta.firstSeen}000`),
    lastUpdated: new Date(+`${snippetNode.meta.lastUpdated}000`),
    searchTokens: uniqueElements([
      snippetNode.title,
      snippetNode.language.short,
      snippetNode.language.long,
      ...snippetNode.attributes.tags.filter(tag => tag !== 'beginner' && tag !== 'intermediate' && tag !== 'advanced'),
      ...tokenizeSnippet(
        snippetNode.attributes.text.slice(0, snippetNode.attributes.text.indexOf('\n\n'))
      ),
    ].map(v => v.toLowerCase())).join(' '),
  };
};
