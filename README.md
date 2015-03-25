# A Firewall for Meteor Apps [![Build Status](https://travis-ci.org/meteorhacks/firewall.svg?branch=master)](https://travis-ci.org/meteorhacks/firewall)

This is an application level firewall for Meteor. Firewall can detect malicious users of your app and block those users. 

But, we've build **basic rate limiting** support and it is well tested and works with most of the Meteor deployments techniques. We've huge roadmap and a feature set.

![A Firewall for Meteor](https://cldup.com/7LLtciFLqg.png)

## Installation

~~~
meteor add meteorhacks:firewall
~~~

Firewall comes with generic set of defaults works for a common Meteor app. But, it's better if you can tweak them for your needs. Refer following section for that.

> All the configurations are based on either env. variables or with Meteor.settings

## Supported Features

Let's talk about supported features.

### DDP Rate Limiting

You can configure a maximum number of DDP requests allowed per IP. If any of the IPs exceed that limit, we'll block that IP for couple of minutes. 

We don't disconnect the DDP connection, but rather ignore the traffic. By doing that, attacker can't detect whether we've blocked his requests or our app goes down.

Here are some parameters you can configure.

|Description       | Environment Variable    | Meteor.settings key | default |
|------------------|-------------------------|---------------------------|---|
|Per IP rate limit | `FIREWALL_PER_IP_MAX_RPS` | `firewall.rateLimits.perIp` | 50|
|Time to block an IP | `FIREWALL_BLOCK_IP_FOR_MILLIS` | `firewall.times.blockIpFor` | 120000|

### Human Verification (Captcha Support)

Sometimes, it's possible for attacker to exist with legitimate users. So, when we block requests, legitimate users won't be able access our app. To solve this issue, we ask users to verify them as humans by completing a captcha.

Here are some parameters you can configure

|Description       | Environment Variable    | Meteor.settings key | default |
|------------------|-------------------------|---------------------------|---|
|Captcha Site Key | `FIREWALL_CAPTCHA_SITE_KEY` | `firewall.captcha.siteKey` | |
|Captcha Secret | `FIREWALL_CAPTCHA_SECRET` | `firewall.captcha.secret` | |
|Per Human Rate Limit | `FIREWALL_PER_HUMAN_MAX_RPS` | `firewall.times.blockIpFor` | 20 |
|Human Lifetime (expired after that) | `FIREWALL_HUMAN_LIVES_UPTO_MILLIS` | `firewall.times.humanLivesUpto` | 3600000 |

> Visit [Google's Recaptcha](https://www.google.com/recaptcha/intro/index.html) website to get Captcha keys for your domain. We've added a default set of keys works on locally, meteor.com and onmodulus.net to make your development experience simpler. 
> But, you should get a new pair of keys for a production deployment.

### Humans Only Mode

Let's say, your app is under an attack. So, you can make your app to reject all DDP requests and ask for human verification by default. This is how you can configure it.

To enable this mode. Just export following env. variable or Meteor settings key.

* Env. Variable: FIREWALL_ONLY_FOR_HUMANS
* Meteor Settings key: firewall.onlyForHumans

## Support Deployment Methods

If your app behind a proxy or SSL terminator, it needs to add `x-forwarded-for` header with the actual IP address. 

### Tested Proxies / SSL Terminators

* [x] proxy of meteor.com
* [x] proxy of modulus.io
* [x] Cloudflare
* [x] Cloudflare with SSL
* [x] Nginx with [proxy_set_header](https://rtcamp.com/tutorials/nginx/forwarding-visitors-real-ip/)

### Failed Proxies / SSL Terminators

* [x] Meteor Up's SSL terminator - Will have a fix soon.