#!/bin/bash
# Fix Next.js 15 params Promise issue

files=(
  "src/app/api/business/photos/[photoId]/primary/route.ts"
  "src/app/api/business/reviews/[reviewId]/reply/route.ts"
  "src/app/api/business/reviews/[reviewId]/verify/route.ts"
  "src/app/api/reviews/[reviewId]/report/route.ts"
  "src/app/api/reviews/[reviewId]/vote/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace params type and await params
    sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"
    sed -i 's/const { \([^}]*\) } = params;/const { \1 } = await params;/g' "$file"
  fi
done

echo "Done!"
