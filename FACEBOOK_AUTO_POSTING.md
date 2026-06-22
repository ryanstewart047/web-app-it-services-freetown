# Facebook Auto Posting

The admin panel is available at:

```text
/admin/facebook-auto-post
```

## Required Environment Variables

```env
FACEBOOK_PAGE_ID="your-page-id"
FACEBOOK_PAGE_ACCESS_TOKEN="your-long-lived-page-access-token"
FACEBOOK_GRAPH_API_VERSION="v23.0"
CRON_SECRET="a-long-random-secret"
```

The Facebook token must be a Page access token with permission to publish posts/photos to the target page. Keep it in your hosting provider's environment variables, not in client-side code.

## Scheduler

`vercel.json` runs this endpoint hourly:

```text
/api/cron/facebook-auto-post
```

The endpoint only posts when automation is enabled and the configured minimum interval has passed. For example, if the panel is set to 24 hours, the hourly check will skip until the next post is due. You can also trigger a post manually from the admin panel.

Vercel Cron requests are accepted when they arrive with Vercel's official `vercel-cron/1.0` user agent. `CRON_SECRET` is still recommended for external schedulers or manual server-to-server calls.

For external schedulers, call:

```text
GET https://www.itservicesfreetown.com/api/cron/facebook-auto-post?secret=YOUR_CRON_SECRET
```

## Photo Requirements

Photo URLs must be publicly accessible by Meta's crawler. Avoid private links, localhost URLs, or images that require authentication.
