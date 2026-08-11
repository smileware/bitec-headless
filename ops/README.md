# GraphQL bottleneck rollout

The frontend and WordPress changes must be deployed in this order so the event
blocks never depend on an endpoint that is not installed yet.

## Test-environment order

1. Follow `wordpress/README.md` and install the MU plugin with the GraphQL gate disabled.
2. Verify the lean event REST endpoint for both `en` and `th`.
3. Configure the frontend environment variables below.
4. Build and deploy the frontend patch.
5. Exercise EN/TH pages, cold and warm pagination, filters, details, and every registered dynamic block.
6. Observe GraphQL logs and CPU for 60 minutes before enabling the WordPress gate.
7. Test the webhook, enable the gate, and observe for another 150 minutes.

## Frontend environment

Recommended non-secret values:

```text
GRAPHQL_CACHE_TTL=3600
GRAPHQL_CACHE_JITTER=3600
GRAPHQL_ORIGIN_TIMEOUT_MS=8000
GRAPHQL_ORIGIN_CONCURRENCY=2
GRAPHQL_SLOW_LOG_MS=1000
BLOCK_PREFETCH_BUDGET_MS=1500
```

Required secrets:

```text
WORDPRESS_GRAPHQL_SECRET=<match BITEC_GRAPHQL_ORIGIN_SECRET>
REVALIDATE_SECRET=<match BITEC_REVALIDATE_SECRET>
```

Set `GRAPHQL_DIAGNOSTICS=true` only during a bounded observation window; it
records operation/cache outcomes but never query variables or secret values.

## Acceptance window

- WordPress GraphQL average at or below 8 requests/minute.
- Origin p95 below 3 seconds, max below 8 seconds, and no request at or above 10 seconds.
- No browser user-agent in `/graphql` access logs.
- Cold pagination at or below 3 seconds; warm at or below 250ms.
- No old list is visible while pagination or filters load.
- Complete at least one 120-minute cache cycle without a synchronized burst.

Do not purge caches, restart services, or enable either WordPress object-cache
plugin during the rollout window. Cloudways hardening follows only after the
code path is stable; see `cloudways/README.md`.
