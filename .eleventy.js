const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Markdown mit Zeilenumbrüchen
  const md = markdownIt({ html: true, breaks: true, linkify: true });
  eleventyConfig.setLibrary("md", md);

  // Filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("year", () => {
    return new Date().getFullYear();
  });

  eleventyConfig.addFilter("markdownify", (str) => {
    if (!str) return "";
    return md.render(str);
  });

  // Texte Collection
  eleventyConfig.addCollection("texte", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/texte/*.md").sort((a, b) => b.date - a.date);
  });

  // Passthrough
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/admin");

  // Dev-Server
  eleventyConfig.setServerOptions({
    host: "0.0.0.0",
    port: 8080,
  });

  return {
    dir: {
      input: "src",
      includes: "_layouts",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
