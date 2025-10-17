#!/bin/bash
echo "Building Haguenau.pro..."
export SKIP_BUILD_STATIC_GENERATION=true
npm run build
