import Remark from 'remark';
import remarkOptions from 'config/remark';
import toHAST from 'mdast-util-to-hast';
import hastToHTML from 'hast-util-to-html';
import visit from 'unist-util-visit';
import Prism from 'prismjs';
import prismComponents from 'prismjs/components';
import { escapeHTML, optimizeAllNodes } from 'utils';

// Setup Remark using the appropriate options.
const remark = new Remark().data('settings', remarkOptions);

const transformers = [
  // Inject class into blog lists' <ol> elements
  {
    blogType: 'blog.list',
    matcher: /<ol>/g,
    replacer: '<ol class="blog-list">',
  },
  // Inject paragraphs and class into blog lists' <li> elements
  {
    blogType: 'blog.list',
    matcher: /<li>\n*(.+?)\n((?!<li>).+?)\n*<\/li>/g,
    replacer: '<li class="blog-list-item">$1</p><p>$2</li>',
  },
  // Add 'rel' and 'target' to external links
  {
    blogType: 'any',
    matcher: /(href="https?:\/\/)/g,
    replacer: 'target="_blank" rel="nofollow noopener noreferrer" $1',
  },
  // Convert blog post code to the appropriate elements
  {
    blogType: 'any',
    matcher: /<pre class="language-([^"]+)" data-code-language="([^"]*)">([\s\S]*?)<\/pre>/g,
    replacer:
      '<pre class="blog-code language-$1 notranslate" data-code-language="$2">$3</pre>',
  },
  // Convert blog blockquotes to the appropriate elements
  {
    blogType: 'any',
    matcher: /<blockquote>\s*\n*\s*<p>([\s\S]*?)<\/p>\s*\n*\s<\/blockquote>/g,
    replacer: '<blockquote class="blog-quote">$1</blockquote>',
  },
  // Convert blog titles h3 and below to the appropriate elements
  {
    blogType: 'any',
    matcher: /<h([123])>([\s\S]*?)<\/h\d>/g,
    replacer: '<h3 class="blog-body-title">$2</h3>',
  },
  // Convert blog titles h4 and above to the appropriate elements
  {
    blogType: 'any',
    matcher: /<h([456])>([\s\S]*?)<\/h\d>/g,
    replacer: '<h4 class="blog-body-title">$2</h4>',
  },
  // Convert blog tables to the appropriate elements
  {
    blogType: 'any',
    matcher: /<table>([\s\S]*?)<\/table>/g,
    replacer: '<table class="blog-table">$1</table>',
  },
  // Convert blog cross tables to the appropriate elements
  {
    blogType: 'any',
    matcher: /<table class="([^"]+)">\s*\n*\s*<thead>\s*\n*\s*<tr>\s*\n*\s*<th><\/th>/g,
    replacer: '<table class="$1 with-primary-column"><thead><tr><th></th>',
  },
  // Convert image credit to the appropriate element
  {
    blogType: 'any',
    matcher: /<p>\s*\n*\s*<strong>Image credit:<\/strong>([\s\S]*?)<\/p>/g,
    replacer: '<p class="blog-image-credit">Image credit: $1</p>',
  },
];

export class MarkdownParser {
  /**
   * Get the real name of a language given it or an alias.
   * @param {string} name - Name or alias of a language.
   */
  static _getBaseLanguageName = name => {
    if (prismComponents.languages[name]) return name;
    return Object.keys(prismComponents.languages).find(language => {
      const { alias } = prismComponents.languages[language];
      if (!alias) return false;
      return Array.isArray(alias) ? alias.includes(name) : alias === name;
    });
  };

  /**
   * Loads prism languages on-demand (smartly doesn't load already loaded ones).
   * Throws and error if the language is invalid or not supported.
   * @param {string} language - A valid prism language name, as returned from
   * `getBaseLanguageName` or similar.
   */
  static _loadPrismLanguage = language => {
    if (!language)
      throw new Error(`Prism doesn't support language '${language}'.`);
    const languageData = prismComponents.languages[language];
    if (Prism.languages[language] || languageData.option === `default`) return;

    if (languageData.require) {
      // Load the required language first
      if (Array.isArray(languageData.require))
        languageData.require.forEach(this._loadPrismLanguage);
      else this._loadPrismLanguage(languageData.require);
    }

    require(`prismjs/components/prism-${language}.js`);
  };

  /**
   * Given some code and a language, returns the prism-highlighted code.
   * Automatically gets prim language names and loads languages on demand.
   * @param {string} language - A language name or alias.
   * @param {string} code - The code to be highlighted.
   */
  static _highlightCode = (language, code) => {
    if (!Prism.languages[language]) {
      const baseLanguage = this._getBaseLanguageName(language);
      if (!baseLanguage || baseLanguage === 'text') return escapeHTML(code);
      this._loadPrismLanguage(baseLanguage);
    }
    return Prism.highlight(code, Prism.languages[language], language);
  };

  /**
   * Parses markdown into HTML from a given markdown string, using remark + prismjs.
   * @param {string} markdown - The markdown string to be parsed.
   */
  static parseMarkdown = (markdown, isText = false, langData = []) => {
    const ast = remark.parse(markdown);

    // Highlight code blocks
    visit(ast, `code`, node => {
      const languageName = node.lang ? node.lang : `text`;
      node.type = `html`;
      const highlightedCode = this._highlightCode(languageName, node.value);
      const languageStringLiteral =
        isText && langData && langData.length
          ? (
              langData.find(l => l.shortCode === languageName) || {
                languageLiteral: '',
              }
            ).languageLiteral
          : '';
      node.value = isText
        ? [
            `<div class="gatsby-highlight" data-language="${languageName}">`,
            `<pre class="language-${languageName}" data-code-language="${languageStringLiteral}">`,
            `${highlightedCode.trim()}`,
            `</pre>`,
            `</div>`,
          ].join('')
        : `${highlightedCode}`;
    });

    // Highlight inline code blocks
    visit(ast, `inlineCode`, node => {
      node.type = `html`;
      node.value = `<code class="notranslate">${escapeHTML(node.value)}</code>`;
    });

    const htmlAst = toHAST(ast, { allowDangerousHtml: true });
    return hastToHTML(htmlAst, { allowDangerousHtml: true });
  };

  static parseSegments = (
    { texts, codeBlocks },
    { isBlog, type, assetPath, langData }
  ) => {
    const result = {};
    Object.entries(texts).forEach(([key, value]) => {
      if (!value) return;
      result[key] = value.trim()
        ? this.parseMarkdown(value, true, langData)
        : '';
    });
    if (isBlog) {
      result.fullDescription = transformers.reduce(
        (acc, { blogType, matcher, replacer }) => {
          if (blogType === 'any' || blogType === type)
            return acc.replace(matcher, replacer);
          return acc;
        },
        result.fullDescription
      );
      // Transform relative paths for images
      result.fullDescription = result.fullDescription.replace(
        /(<p>)*<img src="\.\/([^"]+)"([^>]*)>(<\/p>)*/g,
        (match, openTag, imgSrc, imgRest) =>
          `<img class="card-image" src="${assetPath}${imgSrc}"${imgRest}>`
      );
    } else {
      Object.entries(codeBlocks).forEach(([key, value]) => {
        if (!value) return;
        result[key] = value.trim()
          ? optimizeAllNodes(this.parseMarkdown(value)).trim()
          : '';
      });
    }
    return result;
  };
}
