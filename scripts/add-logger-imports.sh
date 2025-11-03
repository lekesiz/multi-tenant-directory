#!/bin/bash

# logger kullanılan ama import edilmemiş dosyaları bul ve import ekle
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Dosyada logger kullanılıyor mu?
  if grep -q "logger\." "$file"; then
    # logger import'u var mı?
    if ! grep -q "from '@/lib/logger'" "$file" && ! grep -q 'from "@/lib/logger"' "$file"; then
      # İlk import satırını bul
      first_import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
      
      if [ -n "$first_import_line" ]; then
        # İlk import'tan önce logger import'unu ekle
        sed -i "${first_import_line}i import { logger } from '@/lib/logger';" "$file"
        echo "Added logger import to: $file"
      fi
    fi
  fi
done

echo "Import addition complete!"
