import fs from 'fs-extra';
import path from 'path';
import { red } from 'kleur';
import frontmatter from 'front-matter';
import { exec } from 'child_process';

/**
 * Reads all files in a directory and returns the resulting array.
 * @param directoryPath The path of the directory to read.
 * @param withPath Should the path be included into the final result.
 * @param exclude File names to be excluded.
 */
export const getFilesInDir = directoryPath => {
  try {
    let directoryFilenames = fs.readdirSync(directoryPath);
    directoryFilenames.sort((a, b) => {
      a = a.toLowerCase();
      b = b.toLowerCase();
      if (a < b) return -1;
      if (a > b) return 1;
      // Technically, this should never run as names in a directory are unique
      /* istanbul ignore next */
      return 0;
    });

    return directoryFilenames;
  } catch (err) {
    /* istanbul ignore next */
    console.log(`${red('[ERROR]')} Error while getting directory files: ${err}`);
    /* istanbul ignore next */
    process.exit(1);
  }
};

/**
 * Gets the data from a snippet file in a usable format, using frontmatter.
 * @param snippetsPath The path of the snippets directory.
 * @param snippet The name of the snippet file.
 */
export const getData = (snippetsPath, snippet) => frontmatter(
  fs.readFileSync(path.join(snippetsPath, snippet), 'utf8')
);

/**
 * Gets the code blocks for a snippet.
 * @param str The snippet's raw content.
 * @param config The project's configuration file.
 */
export const getCodeBlocks = (str, config) => {
  const regex = /```[.\S\s]*?```/g;
  let results = [];
  let m = null;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex += 1;

    // eslint-disable-next-line
    m.forEach(match => {
      results.push(match);
    });
  }
  const replacer = new RegExp(
    `\`\`\`${config.language.short}([\\s\\S]*?)\`\`\``,
    'g'
  );
  if(config.optionalLanguage && config.optionalLanguage.short) {
    const optionalReplacer = new RegExp(`\`\`\`${config.optionalLanguage.short}([\\s\\S]*?)\`\`\``, 'g');
    results = results.map(v =>
      v
        .replace(replacer, '$1')
        .replace(optionalReplacer, '$1')
        .trim());
    if (results.length > 2) {
      return {
        style: results[0],
        src: results[1],
        example: results[2],
      };
    }
    return {
      style: '',
      src: results[0],
      example: results[1],
    };
  } else {
    results = results.map(v => v.replace(replacer, '$1').trim());
    return {
      src: results[0],
      example: results[1],
    };
  }
};

/**
 * Gets the textual content for a snippet.
 * @param str The snippet's raw content.
 */
export const getTextualContent = str =>
  str.slice(0, str.indexOf('```')).replace(/\r\n/g, '\n');

/**
 * Gets the git metadata for a snippet.
 * @param snippet The name of the snippet file.
 */
export const getGitMetadata = async(snippet, snippetsPath) => {
  const getFirstSeen = new Promise(resolve => exec(
    `cd ${snippetsPath}; git log --diff-filter=A --pretty=format:%at -- ${snippet} | head -1`,
    (error, stdout) => resolve(stdout.toString().replace('\n', ''))
  ));
  const getLastUpdated = new Promise(resolve => exec(
    `cd ${snippetsPath}; git log -n 1 --pretty=format:%at -- ${snippet} | head -1`,
    (error, stdout) => resolve(stdout.toString().replace('\n', ''))
  ));
  const getUpdateCount = new Promise(resolve => exec(
    `cd ${snippetsPath}; git log --pretty=%H -- ${snippet}`,
    (error, stdout) => resolve(stdout.toString().split('\n').length)
  ));
  let metaData = {};
  await Promise.all([
    getFirstSeen,
    getLastUpdated,
    getUpdateCount,
  ]).then(values => {
    metaData = {
      firstSeen: values[0],
      lastUpdated: values[1],
      updateCount: values[2],
    };
  });
  return metaData;
};

/**
 * Gets the tag array for a snippet from the tags string.
 * @param tagStr The string of tags for the snippet.
 */
export const getTags = tagStr =>
  tagStr
    .split(',')
    .reduce((acc, t) => {
      const _t = t.trim();
      if(!acc.includes(_t)) acc.push(_t);
      return acc;
    }, []);

/**
 * Gets the snippet id from the snippet's filename.
 * @param snippetFilename Filename of the snippet.
 */
export const getId = snippetFilename => snippetFilename.slice(0, -3);

/**
 * Synchronously read all snippets and sort them as necessary.
 * The sorting is case-insensitive.
 * @param snippetsPath The path of the snippets directory.
 */
export const readSnippets = async(snippetsPath, config) => {
  const snippetFilenames = getFilesInDir(snippetsPath, false);

  let snippets = {};
  try {
    for (let snippet of snippetFilenames) {
      let data = getData(snippetsPath, snippet);
      snippets[snippet] = {
        id: getId(snippet),
        title: data.attributes.title,
        type: 'snippet',
        attributes: {
          fileName: snippet,
          text: getTextualContent(data.body),
          codeBlocks: getCodeBlocks(data.body, config),
          tags: getTags(data.attributes.tags),
        },
        meta: await getGitMetadata(snippet, snippetsPath),
      };
    }
  } catch (err) {
    /* istanbul ignore next */
    console.log(`${red('[ERROR]')} Error while reading snippets: ${err}`);
    /* istanbul ignore next */
    process.exit(1);
  }
  return snippets;
};

export default {
  getFilesInDir,
  getData,
  getId,
  getCodeBlocks,
  getTextualContent,
  getGitMetadata,
  getTags,
  readSnippets,
};
