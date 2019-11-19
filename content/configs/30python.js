export default {
  name: '30 seconds of Python',
  dirName: '30python',
  repoUrl: 'https://github.com/30-seconds/30-seconds-of-python',
  snippetPath: 'snippets',
  requirables: [
    'snippet_data/snippets.json',
  ],
  slug: 'python',
  featured: 3,
  theme: {
    backColor: '#3c77a9',
    foreColor: '#ffffff',
  },
  biasPenaltyMultiplier: 1.02,
  tagScores: {
    'list': 4,
    'string': 3,
    'math': 2,
    'utility': 1,
  },
  keywordScores: {
    'list': 5,
    'comprehension': 4,
    'dictionary': 4,
    'sort': 3,
    'filter': 3,
    'date': 3,
    'range': 3,
    'index': 2,
    'add': 2,
    'pop': 2,
    'strip': 2,
    'remove': 1,
    'append': 1,
    'math:': 1,
    'find': 1,
    'get': 1,
    'loop': 1,
    'function': 1,
  },
};
