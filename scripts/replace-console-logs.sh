#!/bin/bash

# Console.log'ları logger'a çevir
echo "Replacing console.log with logger.info..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # console.log -> logger.info
  sed -i 's/console\.log(/logger.info(/g' "$file"
  
  # console.error -> logger.error
  sed -i 's/console\.error(/logger.error(/g' "$file"
  
  # console.warn -> logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$file"
  
  # console.debug -> logger.debug
  sed -i 's/console\.debug(/logger.debug(/g' "$file"
done

echo "Replacement complete!"
echo "Don't forget to add 'import { logger } from '@/lib/logger';' to files that use logger"
