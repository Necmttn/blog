const { format } = require("date-fns");
const markdownIt = require("markdown-it");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = (eleventyConfig) => {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  // Passthroughs
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  // Filters
  eleventyConfig.addFilter("md", (content = "") => {
    return markdownIt({ html: true }).render(content);
  });

  eleventyConfig.addFilter("readableDate", date => {
    if (!date) return "No Date";
    const offsetSeconds = date.getTimezoneOffset() * 60 * 1000;
    const utcTimestamp = date.getTime() + offsetSeconds;
    const utcDate = new Date(utcTimestamp);

    return format(utcDate, "EEEE MMMM d, yyyy");
  });

  // Collections
  eleventyConfig.addCollection("tagList", collection => {
    const tags = new Set();
    const hiddenTags = [
      "posts",
      "meta",
    ];

    collection.getAll().map(item => {
      (item.data.tags || []).map(tag => tags.add(tag))
    });

    return [...tags].filter(tag => hiddenTags.indexOf(tag) === -1);
  })

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
  });

  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.setTemplateFormats([
    "md",
    "njk",
    "css",
  ]);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      layouts: "_layouts",
    },
  };
}