const { format } = require('date-fns');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');

  eleventyConfig.addFilter('readableDate', date => {
    return format(date, 'EEEE MMMM d, yyyy');
  });

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
  })

  eleventyConfig.setTemplateFormats([
    'md',
    'njk',
    'css',
    'jpg',
  ]);

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      layouts: '_layouts',
    },
  };
}