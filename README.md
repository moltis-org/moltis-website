<p align="center">
  <a href="https://moltis.org"><img src="favicon.svg" alt="Moltis" width="100"></a>
</p>

# moltis-website

Landing page for [Moltis](https://moltis.org), inspired by [OpenClaw](https://github.com/penso/moltis).

- Cloud deploy section: https://moltis.org/#cloud-deploy

## Agent Install Discovery Manifests

The website publishes machine-readable install/discovery files under `/.well-known/`:

- `/.well-known/moltis-install.json` (stable root manifest)
- `/.well-known/moltis-install/channels/stable.json` (moving channel pointer)
- `/.well-known/moltis-install/releases/<version>.json` (immutable per-release manifest)

Update channel/release manifests at release time with:

```bash
npm run install-manifest:update -- --version 0.9.11 --checksums-file /path/to/release-checksums.txt
```
