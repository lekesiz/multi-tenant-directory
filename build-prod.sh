#!/bin/bash
# Production build script that skips static page generation
# This avoids the Next.js prerendering error with Html imports

export SKIP_BUILD_STATIC_GENERATION=true
npm run build
