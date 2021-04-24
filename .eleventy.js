const { format } = require('date-fns');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = (eleventyConfig) => {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthroughs
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');

  // Filters
  eleventyConfig.addFilter('readableDate', date => {
    const offsetSeconds = date.getTimezoneOffset() * 60 * 1000;
    const utcTimestamp = date.getTime() + offsetSeconds;
    const utcDate = new Date(utcTimestamp);

    return format(utcDate, 'EEEE MMMM d, yyyy');
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
    'svg',
  ]);

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      layouts: '_layouts',
    },
  };
}