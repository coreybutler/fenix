# Fenix Web Server

Fenix is a desktop web server for developers. Check out [fenixwebserver.com](http://fenixwebserver.com) for details.
There are some [YouTube videos](http://www.youtube.com/playlist?list=PL6u9ibuk0pbM68hZONUq-vY39ByaXoJj-) of the old version. We do not yet have any screencasts of v3.0.0, but a [live demo for Bleeding Edge Web](https://www.youtube.com/watch?v=KsoNGVScd_c&t=5053s) was recorded during the early development days.

![Fenix 3.0.0](https://docs.fenixwebserver.com/assets/fenix-home.png)

---

If you're using Fenix, we'd love your [feedback](https://coreybutler.typeform.com/to/Vk0v2x)! 

**Fenix 3.0.0 [release candidate 13 for macOS and Windows](https://preview.fenixwebserver.com) is available.**

[Join the Mailing List](https://fenixwebserver.com) (signup on the bottom of the page)

[![Tweet This!](http://i.imgur.com/wWzX9uB.png)](https://twitter.com/intent/tweet?hashtags=nodejs&original_referer=http%3A%2F%2F127.0.0.1%3A91%2F&text=Check%20out%20Fenix%20Web%20Server!&tw_p=tweetbutton&url=http%3A%2F%2Fgithub.com%2Fcoreybutler%2Ffenix&via=author_io) [Tweet About This!](https://twitter.com/intent/tweet?hashtags=nodejs&original_referer=http%3A%2F%2F127.0.0.1%3A91%2F&text=Check%20out%20Fenix%20Web%20Server!&tw_p=tweetbutton&url=http%3A%2F%2Fgithub.com%2Fcoreybutler%2Ffenix&via=author_io)

[![Gitter Chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/coreybutler/fenix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
![Downloads](https://img.shields.io/github/downloads/coreybutler/fenix/v2.0.0/total.svg)

---
**UPDATE 9/18/19**
Fenix 3 is done, for both Mac and Windows. We had to cut a few things, like automatic updates (it will prompt you to download a new version when new updates are available). Unfortunately, the tools for updating an Electron app aren't really sufficient enough to support some of the new features (like the built-in CLI, updating the `PATH`, etc). We are working on a more streamlined autoupdate experience, which will power future versions.

Fenix 3 is just one of several things we've been working on under the Author.io brand to make writing software a more efficient/enjoyable process. Since there are several efforts underway (and only 2 of us working on everything), we're also spending time to turn Author.io into a full-fledged company. Don't worry, Fenix will still be free... we're exploring other monetization options to support continued development, as well as sponsorship for the many open source efforts we're puring time into.

We're also nearly finished with the following:

- [NGN 2.0.0](https://github.com/ngnjs/ngn) - A JS library for building your own frameworks.
- [Chassis](https://github.com/ngn-chassis) - A PostCSS pre-processing framework.
- [Web Components](https://github.com/author-elements) - A web component library.
- [Metadoc](https://github.com/author/metadoc) - A JS documentation utility that produces JSON.

NGN, Chassis, and the web components were all used to build Fenix 3 and the associated websites. NGN has been battle-tested with clients like [TopGolf](https://topgolf.com), [Aunt Bertha](https://auntbertha.com), and several enterprises. We're actively working on Metadoc to produce better documentation for the Fenix 3 API libraries.

We've also released the initial [Fenix 3 docs](https://docs.fenixwebserver.com).

A placeholder website for [author.io](https://www.author.io), a Twitter account [@author_io](https://twitter.com/author_io) and an [Author.io Facebook Page](https://www.facebook.com/softwareauthor) are live.

For those we invited to the early beta, thank you. Your feedback has been invaluable. I'd also like to publicly thank those of you who have donated. Your support means the world to us!

We have some exciting new things coming in 3.0.0:

**Base**
- [x] Abstracted Foundation (i.e. our electron boilerplate)
- [x] Middleware Plugin System (Internal Use Only)
- [x] UI Plugin System (Internal Use Only)

_The plugin system is only for internal use. We hope to expand this for developer use in a later edition._

**Open Core**
- [x] Autoupdate macOS (evergreen) - No more ridiculously long delays between updates!
- [x] Autoupdate Windows (evergreen) - 90% done.
- [x] Brand new UI.
- [x] Native CLI app (no need to `npm install fenix-cli` anymore).
- [x] Automatic port management.
- [x] Port conflict resolution via [porthog](https://github.com/coreybutler/porthog)
- [x] Replace Growl w/ Native System Notifications.
- [x] Optional JS/CSS minification.
- [x] Optional GZip compression.
- [x] Optionally Render Markdown as HTML (used to always do this, now you have a choice).
- [x] Optional ETags.
- [x] Optional CORS Support
- [x] Optional JSON/XML/YAML Pretty-Print.
- [x] Option to output logs to physical file.
- [x] API
- [x] Global Preferences
- [x] Soft Delete of Servers
- [x] "Pretty" names for SSH tunneling (i.e. myapp.localtunnel.me)
- [x] SSH Tunneling Keepalive
- [x] Light Theme
- [x] Dark Theme
- [x] System Tray Support
- [x] "Run in Background" Mode
- [x] Drag 'n' Drop Server Creation (App & System Tray)
- [x] Installer (macOS pkg, Windows NSIS)
- [x] New Responsive File Browser.
- [x] Autodeployment (w/ badge service via author.io)

There have been several requests for things like gzip compression, ETags, etc. These features don't typically make sense for the simplest form of local development, but modern UI development "done right" requires a little more emphasis on networking/transmission. These features become very useful when testing and troubleshooting, so we've made it possible to turn them on/off for each server. We're also extending the Fenix API to manage these things programmatically, and we anticipate releasing a gulp/grunt plugin to help automate local testing workflows.

~~**PRO Edition**~~
- [ ] Log Filtering
- [ ] Advanced Live Reload
- [x] Custom Response Headers.
- [x] Multiple server root directories.
- [x] Realtime connection monitoring & statistics
- [x] SSL Support (Fenix CA)
- [x] Fenix Certificate Authority
  - [x] Windows Trustchain Management
  - [x] OSX Trustchain Management
  - [x] Firefox Trustchain Management
  - [x] Automatic NIC Management & Synchronization

Due to the unique and complex nature of some of these features, we are moving them into a separate project. They will likely resurface in 3.1.x or 3.2.x edition (possibly for free).

<!--![Fenix CA](https://s3.amazonaws.com/uploads.hipchat.com/94386/688041/UjgcuFFGwugcDk0/ssl.png)

![Fenix Firefox](https://s3.amazonaws.com/uploads.hipchat.com/94386/688041/08WgN6yT5e8sgUz/upload.png)-->

<!--Why yes, that _is_ a valid **self-signed** certificate without any annoying browser warnings/errors in Chrome and _Firefox_. Fenix CA automatically handles trust chains for OSX, Windows, and Firefox. It handles all SSL certificate creation/revocation automatically... so you don't have to do anything. It just works. Fenix will even monitor and automatically handle network changes, seamlessly supporting DHCP-assigned IP addresses or changing network conditions. This one's for you, digital nomads, coffeeshop heroes, train commuters, and spotty connectivity sufferers.-->

The request browser will be released as it's own separate app, so it won't be in Fenix 3.0.0. I always felt it was a useful tool, and survey results agree... but it also doesn't fit in as well with the original scope of Fenix. Moving it to it's own project will help it get the attention it needs to be truly awesome.

Finally, we're going "open core". Most of the features above will be free, but more advanced features are slated for a commercial release. As much has we'd like to make this free, devlopment has already grown into a full time effort.

---

# Fenix 2.0 (OLD EDITION)

**Main App:**

![Fenix](http://fenixwebserver.com/img/win32/banner_device.png)

**Webhook Browser**

![Fenix Webhooks](http://fenixwebserver.com/img/win32/bin.png)

The [wiki](https://github.com/coreybutler/fenix/wiki) has additional information about how Fenix works, how to hack on it,
and how to use it on other platforms.  The [release history](https://github.com/coreybutler/fenix/releases) has older versions and a changelog.

## Known Issues

- The [OpenUI5 SDK](http://openui5.hana.ondemand.com) is known to cause an issue with Fenix. See [issue #15](https://github.com/coreybutler/fenix/issues/15) for details.

## Like Fenix?

Making a donation will go towards the development of Fenix. At the moment, I'd love to reach a simple goal of $100 in  _annual_ contributions so I can obtain an Apple Developer license for Fenix... which is the only application I'm distributing on Mac. This would help prevent the "Cannot install from unidentified developer" annoyance some OSX Mavericks users experience. Other contributions would go towards future efforts like hosting a public SSH tunnel (to take some load off localtunnel.me) and new feature development.

[Support OSS Development via Stripe](https://coreybutler.typeform.com/to/ZY4pyp) or [Become a Patron](https://patreon.com/coreybutler)

## GPL License

Fenix 2.0 is available under the GPL license.
