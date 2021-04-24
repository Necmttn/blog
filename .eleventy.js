const { format } = require('date-fns');
const svgContents = require('eleventy-plugin-svg-contents');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');

  eleventyConfig.addPlugin(svgContents);

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