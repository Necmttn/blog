---
tags:
  - posts
  - tech
  - meta
date: 2021-04-24
title: Enter the ~Blogosphere~
description: I've got hobbies and dang it I'm gonna write about 'em. Since the pandemic began, I've gotten into all sorts of weird shit that I never thought I'd be into. Running, blockchain tech, impromptu road trips, and now blogging. You're gonna hear about all of it here, but first let's do the obligatory "blog tech" post.
---
I've got hobbies and dang it I'm gonna write about 'em. Since the pandemic began, I've gotten into all sorts of weird shit that I never thought I'd be into. Running, blockchain tech, impromptu road trips, and now blogging. You're gonna hear about all of it here, but first let's do the obligatory "blog tech" post.<!-- excerpt -->
##### Open Source
It's all open source. [View the repository on GitHub.](https://github.com/marknotfound/blog)

##### Hosting
This blog is hosted by [GitHub Pages](https://pages.github.com/) because I didn't want to pay for EC2 or set up a kubernetes cluster. I don't hate myself enough for that.

##### Static Site Generator
I'm running [Eleventy](https://www.11ty.dev/) for the whole shebang. Templates are written in [Nunjucks](https://mozilla.github.io/nunjucks/) which, to be honest, I don't care for much as a templating language, but it's the default for Eleventy and I wanted to start simple. It's growing on me a little as I use it more.

Posts are written in markdown. This is good because it will force me to use markdown and eventually I'll memorize the syntax for inserting an image.

Eleventy itself has been pretty cool. It was recommended to me last year by my old colleague [Kai](https://twitter.com/kai_cataldo). I haven't dove too deep in yet, but the community seems nice and there are plenty of plugins for more advanced features like RSS and such. The last SSG I used was Jekyll, but I was never a fan of Ruby and it never "felt good" to me.

The biggest gotcha with Eleventy for me was the [dates being off by one day](https://www.11ty.dev/docs/dates/#dates-off-by-one-day). I solved this by fudging the local time and offsetting it by the UTC offset:
``` js
eleventyConfig.addFilter('readableDate', date => {
  const offsetSeconds = date.getTimezoneOffset() * 60 * 1000;
  const utcTimestamp = date.getTime() + offsetSeconds;
  const utcDate = new Date(utcTimestamp);

  return format(utcDate, 'EEEE MMMM d, yyyy');
});
```
There is almost definitely a "better" way to do this. Oh, and the syntax highlighting? [There's a plugin for that](https://www.11ty.dev/docs/plugins/syntaxhighlight/).

##### Styling
I am using [Skeleton](http://getskeleton.com/) for the boilerplate and responsiveness. It's simple, lightweight, and works but is no longer maintained as far as I can tell. I do some [very minor overrides](https://github.com/marknotfound/blog/blob/master/src/css/index.css) in plain old CSS, but it's mostly Skeleton. Dig those light blue links.

##### Icons
Icons are open source from [Feather Icons](https://feathericons.com/).

##### Build & Deploy
The build and deploy process is automated [using GitHub Actions](https://github.com/marknotfound/blog/blob/master/.github/workflows/eleventy_build.yml) and once again I am standing on the shoulders of a great community. I followed [this guide on LinkedIn](https://www.linkedin.com/pulse/eleventy-github-pages-lea-tortay/) from [Léa Tortay](https://github.com/lea37) to get it set up. Thanks Léa!

##### Analytics
Because I want to know if anybody is actually reading this and I don't want to sacrifice anyone's privacy for my own selfish curiosity, I am using [Cronitor](https://cronitor.io) (formerly [Panelbear](https://panelbear.com/)) for analytics. It's privacy focused and doesn't use tracking cookies or garbage like that. It's created by [Anthony Simon](https://anthonynsimon.com/) who I learned about via their very very good blog post [The Architecture Behind A One-Person Tech Startup](https://anthonynsimon.com/blog/one-man-saas-architecture/).

##### Changelog
**2021-05-12** Added citation for icon library. Noted Skeleton is no longer maintained.