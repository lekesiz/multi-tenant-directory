#!/bin/bash

# Pages that need dynamic export
pages=(
  "src/app/[legalSlug]/page.tsx"
  "src/app/annuaire/page.tsx"
  "src/app/categories/[category]/page.tsx"
  "src/app/categories/page.tsx"
  "src/app/companies/[slug]/page.tsx"
  "src/app/contact/page.tsx"
  "src/app/rejoindre/page.tsx"
  "src/app/not-found.tsx"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    # Check if it already has dynamic export
    if ! grep -q "export const dynamic" "$page"; then
      echo "Adding dynamic export to $page"
      
      # Add after imports, before first export or function
      # Find the line number of the first export or function
      line_num=$(grep -n "^export\|^async function\|^function" "$page" | head -1 | cut -d: -f1)
      
      if [ -n "$line_num" ]; then
        # Insert before that line
        sed -i "${line_num}i\\
// Force dynamic rendering because this page uses headers() for domain detection\\
export const dynamic = 'force-dynamic';\\
" "$page"
        echo "✅ Added to $page"
      else
        echo "⚠️  Could not find insertion point in $page"
      fi
    else
      echo "⏭️  $page already has dynamic export"
    fi
  else
    echo "❌ File not found: $page"
  fi
done

echo ""
echo "Done! All pages updated."
