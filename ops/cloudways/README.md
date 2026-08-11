# Cloudways post-deploy hardening

Perform these steps only after the frontend patch and WordPress MU plugin pass test-environment checks.

## PHP-FPM

- Read the current application pool values first.
- If `pm.max_children` is greater than 6, set it to 6; otherwise leave it unchanged.
- Set `pm.max_requests` to 300 and `request_terminate_timeout` to 30 seconds where Cloudways exposes those settings.
- Do not restart or purge services during the observation window.

## Storage

- Current block storage is 94% used.
- Keep 14 days of compressed rotated logs and verify rotation before removing older rotations.
- Do not delete WordPress media automatically.
- BITEC currently uses about 30GB: approximately 25GB uploads, 3.6GB logs, and 1.6GB `ai1wm-backups`.
- Remove or offload `ai1wm-backups` only after confirming a recoverable external backup.
- The separate `asdfsxducw` application uses about 51GB, almost entirely uploads; handle it as a separate owner-approved task.
- Target block-storage usage below 80%.

## Rollback and scaling

- Disable the GraphQL gate with `BITEC_GRAPHQL_GATE_ENABLED=false` if an expected consumer receives 403.
- Do not enable Object Cache Pro or WPGraphQL Object Cache.
- Consider scaling only if CPU pressure `avg10` remains above 30 for 10 minutes after request fan-out is removed.
