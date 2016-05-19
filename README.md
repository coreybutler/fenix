I'm currently working on the next version of Fenix & would love your [feedback](https://coreybutler.typeform.com/to/Vk0v2x)!

[![Tweet This!][1.1] Share This!][1]
[1.1]: http://i.imgur.com/wWzX9uB.png (Tweet about Fenix Web Server)
[1]: https://twitter.com/intent/tweet?hashtags=nodejs&original_referer=http%3A%2F%2F127.0.0.1%3A91%2F&text=Check%20out%20Fenix%20Web%20Server!&tw_p=tweetbutton&url=http%3A%2F%2Fgithub.com%2Fcoreybutler%2Ffenix&via=goldglovecb

# Fenix Web Servers

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/coreybutler/fenix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
![Downloads](https://img.shields.io/github/downloads/coreybutler/fenix/v2.0.0/total.svg)

Fenix is a desktop web server for developers. Check out [fenixwebserver.com](http://fenixwebserver.com) for details.
There's also a companion [command line app](https://github.com/coreybutler/fenix-cli). There are some [YouTube videos](http://www.youtube.com/playlist?list=PL6u9ibuk0pbM68hZONUq-vY39ByaXoJj-) available as well.

**UPDATES (As of 5/19/16)**

Fenix 3.0.0 is in full development. [@gbdrummer](https://github.com/gbdrummer) is building the new UI, which is coming along nicely. We've also moved from NW.js to Electron, and have pretty much rewritten everything from scratch. 

We're not announcing a release date yet, but we have some exciting new things coming in 3.0.0:

- [ ] Autoupdate (Evergreen) - No more ridiculously long delays between updates!
- [ ] Brand New UI
- [ ] Native CLI app (no need to `npm install fenix-cli` anymore)
- [x] Automatic port detection
- [x] Replace Growl w/ Native System Notifications
- [x] SSL Support (Fenix CA)

Here's a preview of the upcoming SSL/TLS support in action:

![Fenix CA](https://s3.amazonaws.com/uploads.hipchat.com/94386/688041/UjgcuFFGwugcDk0/ssl.png)

Why yes, that _is_ a valid self-signed certificate without any annoying browser warnings/errors. Fenix CA automatically handles trust chains for OSX, Windows, and Firefox. Fenix will even monitor network changes to seamlessly support DHCP-assigned IP addresses for all of you digital nomads working out of coffeeshops, trains, or other areas with spotty connectivity.

The request browser will be released as it's own separate app, so it won't be in Fenix 3.0.0. I always felt it was a useful tool, and survey results agree... but it also doesn't fit in with the original scope of Fenix. Moving it to it's own project will help it get the attention it needs to be awesome.

Finally, these new features will all be a part of the free version of Fenix. Additional features are in the pipeline, slated for commercial release. I'll release more details about that after Fenix 3.0.0 is released. In the meantime, use the survey (above) to influence the direction of Fenix!

**Main App:**

![Fenix](http://fenixwebserver.com/img/win32/banner_device.png)

**Webhook Browser**

![Fenix Webhooks](http://fenixwebserver.com/img/win32/bin.png)

The [wiki](https://github.com/coreybutler/fenix/wiki) has additional information about how Fenix works, how to hack on it,
and how to use it on other platforms.  The [release history](https://github.com/coreybutler/fenix/releases) has older versions and a changelog.

## Known Issues

- The [OpenUI5 SDK](http://openui5.hana.ondemand.com) is known to cause an issue with Fenix. See [issue #15](https://github.com/coreybutler/fenix/issues/15) for details.

## Like Fenix?

If you're using Fenix and find it useful, let everyone know! I've started a crude [list of companies](https://github.com/coreybutler/fenix/issues/45) that are using Fenix.

Making a donation will go towards the development of Fenix. At the moment, I'd love to reach a simple goal of $100 in  _annual_ contributions so I can obtain an Apple Developer license for Fenix... which is the only application I'm distributing on Mac. This would help prevent the "Cannot install from unidentified developer" annoyance some OSX Mavericks users experience. Other contributions would go towards future efforts like hosting a public SSH tunnel (to take some load off localtunnel.me) and new feature development.

[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/coreybutler/)

## GPL License

Fenix 2.0 is available under the GPL license.
