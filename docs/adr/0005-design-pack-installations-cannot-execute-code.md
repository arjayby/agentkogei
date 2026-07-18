# Design Pack installations cannot execute code

Design Packs will declare files, metadata, dependencies, and setup instructions but cannot provide executable installation hooks. The CLI will validate target paths, preview changes, and reject conflicts without silently running pack-supplied scripts, dependency installation, or package-manager commands. This limits the damage an untrusted third-party pack can cause and makes “install any compatible pack” safe enough to support without granting arbitrary code execution.
