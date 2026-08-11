# BITEC WordPress rollout

1. Copy `mu-plugins/bitec-headless.php` to `wp-content/mu-plugins/` on the test application.
2. Add the following constants to `wp-config.php` with environment-specific secret values:
   - `BITEC_REVALIDATE_URL`
   - `BITEC_REVALIDATE_SECRET`
   - `BITEC_GRAPHQL_ORIGIN_SECRET`
   - `BITEC_GRAPHQL_GATE_ENABLED` (start with `false`)
3. Set matching Vercel variables `REVALIDATE_SECRET` and `WORDPRESS_GRAPHQL_SECRET`.
4. Verify `/wp-json/bitec/v1/events?mode=recent&limit=1&language=en` before deploying the frontend.
5. Keep the GraphQL gate disabled until browser-direct GraphQL has been absent for 60 minutes.
6. To roll back origin gating immediately, set `BITEC_GRAPHQL_GATE_ENABLED` to `false`.

Never commit secret values to this repository.
