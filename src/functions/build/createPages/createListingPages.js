import { chunk } from 'functions/utils';
import { transformSnippetIndex } from 'functions/transformers';
import EXPERTISE_LEVELS from 'shared/expertiseLevels';
import literals from 'lang/en/listing';

const ORDERS_MAP = {
  'p': literals.orders.popularity,
  'a': literals.orders.alphabetical,
  'e': literals.orders.expertise,
};

const CARDS_PER_PAGE = 40;

const createListingPages = (
  indexedChunks, listingPage, createPage, context, baseUrl, slugOrderingSegment, ordersList
) => {
  indexedChunks.forEach((chunk, i, chunks) => {
    createPage({
      path: `${baseUrl}/${slugOrderingSegment}/${i + 1}`,
      component: listingPage,
      context: {
        snippetList: chunk,
        paginator: {
          pageNumber: i + 1,
          totalPages: chunks.length,
          baseUrl,
          slugOrderingSegment,
        },
        sorter: {
          orders: ordersList.map(order => (
            {
              url: `${baseUrl}/${order}/1`,
              title: ORDERS_MAP[order],
            }
          )),
          selectedOrder: ORDERS_MAP[slugOrderingSegment],
        },
        ...context,
      },
    });
  });
  // Create Home page
  if (context.listingType === 'main' && slugOrderingSegment === 'p') {
    createPage({
      path: `/`,
      component: listingPage,
      context: {
        snippetList: indexedChunks[0],
        paginator: {
          pageNumber: 1,
          totalPages: indexedChunks.length,
          baseUrl,
          slugOrderingSegment,
        },
        sorter: {
          orders: ordersList.map(order => (
            {
              url: `${baseUrl}/${order}/1`,
              title: ORDERS_MAP[order],
            }
          )),
          selectedOrder: ORDERS_MAP[slugOrderingSegment],
        },
        ...context,
      },
    });
  }
};

const createListingPagesWithOrderOptions = (
  listingPage, createPage, context, baseUrl, orders, chunks, contextCustomizer = () => ({})
) => {
  orders.forEach((order, i) => {
    createListingPages(
      chunks[i],
      listingPage,
      createPage,
      { ...context, ...contextCustomizer(order, i)},
      baseUrl,
      order,
      orders
    );
  });
};

/* eslint-disable no-extra-boolean-cast */
const createAllListingPages = (searchIndex, listingMetas, listingPage, createPage, context) => {
  // Create listing pages for the main listing
  const transformedIndex = transformSnippetIndex(searchIndex.edges);
  const popularChunks = chunk(transformedIndex, CARDS_PER_PAGE);
  const alphabeticalChunks = chunk(transformedIndex.sort((a, b) => a.title.localeCompare(b.title)), CARDS_PER_PAGE);
  const expertiseChunks = chunk(transformedIndex.sort((a, b) =>
    a.expertise === b.expertise ? a.title.localeCompare(b.title) :
      !a.expertise ? 1 : !b.expertise ? -1 :
        EXPERTISE_LEVELS.indexOf(a.expertise) - EXPERTISE_LEVELS.indexOf(b.expertise)
  ), CARDS_PER_PAGE);
  const mainListingSublinks = listingMetas
    .filter(v => !v.unlisted)
    .map(v => v.featured > 0 ? v : {...v, featured: 500 })
    .sort((a, b) => a.featured === b.featured ? a.name - b.name : a.featured - b.featured);
  const mainContextCustomizer = order => {
    return {
      listingSublinks: mainListingSublinks
        .map(l => ({
          ...l,
          link: {
            ...l.link,
            url: l.link.url.replace('/p/1', `/${order}/1`),
          },
        })),
    };
  };

  createListingPagesWithOrderOptions(
    listingPage,
    createPage,
    {
      ...context,
      listingName: literals.snippetList,
      listingTitle: literals.snippetList,
      listingType: 'main',
      listingSublinks: mainListingSublinks,
      pageDescription: literals.pageDescription('main', {
        snippetCount: transformedIndex.length,
      }),
    },
    '/list',
    ['p', 'a', 'e'],
    [popularChunks, alphabeticalChunks, expertiseChunks],
    mainContextCustomizer
  );

  listingMetas
    .filter(v => !v.archived)
    .forEach(listingMeta => {
      const slugPrefix = listingMeta.slugPrefix;
      const searchIndexName = searchIndex.edges.find(s => s.node.slug.startsWith(`${slugPrefix}`)).node.language.long || '';
      const searchIndexSlugData = searchIndex.edges.filter(s =>
        s.node.slug.startsWith(`${slugPrefix}`) ||
        (s.node.blog && s.node.tags.all.find(t => t.toLowerCase() === searchIndexName.toLowerCase()))
      );
      const transformedSlugChunks = transformSnippetIndex(searchIndexSlugData);
      const popularSlugChunks = chunk(transformedSlugChunks, CARDS_PER_PAGE);
      const alphabeticalSlugChunks = chunk(transformedSlugChunks.sort((a, b) => a.title.localeCompare(b.title)), CARDS_PER_PAGE);
      const expertiseSlugChunks = chunk(transformedSlugChunks.sort((a, b) =>
        a.expertise === b.expertise ? a.title.localeCompare(b.title) :
          !a.expertise ? 1 : !b.expertise ? -1 :
            EXPERTISE_LEVELS.indexOf(a.expertise) - EXPERTISE_LEVELS.indexOf(b.expertise)
      ), CARDS_PER_PAGE);
      const searchIndexTagPrefixes = listingMeta.tags;
      const slugContextCustomizer = order => {
        return {
          listingSublinks: listingMeta.blog ? [] : [
            {
              link: {
                internal: true,
                url: `${slugPrefix}/${order}/1`,
              },
              name: literals.tag('all'),
              selected: true,
            },
            ...listingMeta.tags
              .map(tag => ({
                link: {
                  internal: true,
                  url: `${slugPrefix}/t/${tag}/${order}/1`,
                },
                name: literals.tag(tag),
              })),
          ],
        };
      };

      createListingPagesWithOrderOptions(
        listingPage,
        createPage,
        {
          ...context,
          listingName: listingMeta.blog ? literals.blog : literals.codelang(searchIndexName),
          listingTitle: listingMeta.blog ? literals.blog : literals.codelang(searchIndexName),
          listingType: listingMeta.blog ? 'blog' : 'language',
          pageDescription: literals.pageDescription(listingMeta.blog ? 'blog' : 'language', {
            snippetCount: searchIndexSlugData.length,
            listingLanguage: listingMeta.blog ? 'blog' : searchIndexName,
          }),
        },
        `${slugPrefix}`,
        ['p', 'a', 'e'],
        [popularSlugChunks, alphabeticalSlugChunks, expertiseSlugChunks],
        slugContextCustomizer
      );

      searchIndexTagPrefixes.forEach(tagPrefix => {
        const searchIndexTagData = searchIndex.edges
          .filter(s =>
            s.node.tags.primary === tagPrefix && s.node.slug.startsWith(`${slugPrefix}`) ||
            ( s.node.blog &&
              s.node.tags.all.find(t => t.toLowerCase() === searchIndexName.toLowerCase()) &&
              s.node.tags.all.find(t => t.toLowerCase() === tagPrefix.toLowerCase())
            )
          );
        const transformedTagChunks = transformSnippetIndex(searchIndexTagData);
        const popularTagChunks = chunk(transformedTagChunks, CARDS_PER_PAGE);
        const alphabeticalTagChunks = chunk(transformedTagChunks.sort((a, b) => a.title.localeCompare(b.title)), CARDS_PER_PAGE);
        const expertiseTagChunks = chunk(transformedTagChunks.sort((a, b) =>
          a.expertise === b.expertise ? a.title.localeCompare(b.title) :
            !a.expertise ? 1 : !b.expertise ? -1 :
              EXPERTISE_LEVELS.indexOf(a.expertise) - EXPERTISE_LEVELS.indexOf(b.expertise)
        ), CARDS_PER_PAGE);
        const tagContextCustomizer = order => {
          return {
            listingSublinks: listingMeta.blog ? [] : [
              {
                link: {
                  internal: true,
                  url: `${slugPrefix}/${order}/1`,
                },
                name: literals.tag('all'),
                selected: true,
              },
              ...listingMeta.tags
                .map(tag => ({
                  link: {
                    internal: true,
                    url: `${slugPrefix}/t/${tag}/${order}/1`,
                  },
                  name: literals.tag(tag),
                })),
            ].map(tag => ({ ...tag, selected: tag.link.url.indexOf(`/t/${tagPrefix}/`) !== -1 })),
          };
        };

        createListingPagesWithOrderOptions(
          listingPage,
          createPage,
          {
            ...context,
            listingName: literals.codelangTag(searchIndexName, tagPrefix),
            listingTitle: literals.codelang(searchIndexName),
            listingType: 'tag',
            pageDescription: literals.pageDescription('tag', {
              snippetCount: searchIndexSlugData.length,
              listingLanguage: searchIndexName,
              listingTag: tagPrefix,
            }),
          },
          `${slugPrefix}/t/${tagPrefix}`,
          ['p', 'a', 'e'],
          [popularTagChunks, alphabeticalTagChunks, expertiseTagChunks],
          tagContextCustomizer
        );
      });
    });
};

export default createAllListingPages;
