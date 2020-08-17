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
    matcher: /<pre class="language-[^"]+"><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g,
    replacer: '<pre class="blog-code language-$1">$2</pre>',
  },
  // Convert blog blockquotes to the appropriate elements
  {
    blogType: 'any',
    matcher: /<blockquote>\s*\n*\s*<p>([\s\S]*?)<\/p>\s*\n*\s<\/blockquote>/g,
    replacer: '<blockquote class="blog-quote">$1</blockquote>',
  },
  // Convert image credit to the appropriate element
  {
    blogType: 'any',
    matcher: /<p>\s*\n*\s*<strong>Image credit:<\/strong>([\s\S]*?)<\/p>/g,
    replacer: '<p class="blog-image-credit">Image credit: $1</p>',
  },
];

export default (str, source) => {
  const fullDescription = transformers.reduce(
    (acc, { blogType, matcher, replacer }) => {
      if (blogType === 'any' || blogType === source.blogType)
        return acc.replace(matcher, replacer);
      return acc;
    },
    str
  );
  const description = `<p>${source.shortDescription}</p>`;

  return {
    description,
    fullDescription,
    code: '',
    example: '',
  };
};
