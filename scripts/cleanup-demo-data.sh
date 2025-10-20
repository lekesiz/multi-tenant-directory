#!/bin/bash

# Demo Veri Temizleme Script
# 
# Kullanım:
#   ./scripts/cleanup-demo-data.sh [--dry-run] [--production]
#
# Örnekler:
#   ./scripts/cleanup-demo-data.sh --dry-run           # Test modu (silme yapmaz)
#   ./scripts/cleanup-demo-data.sh                     # Local'de temizlik
#   ./scripts/cleanup-demo-data.sh --production        # Production'da temizlik

set -e

# Varsayılan değerler
DRY_RUN="false"
PRODUCTION="false"
BASE_URL="http://localhost:3000"

# Parametreleri oku
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --production)
      PRODUCTION="true"
      BASE_URL="https://haguenau.pro"
      shift
      ;;
    *)
      echo "Bilinmeyen parametre: $1"
      exit 1
      ;;
  esac
done

# Admin token kontrolü
if [ -z "$ADMIN_CLEANUP_TOKEN" ]; then
  echo "❌ HATA: ADMIN_CLEANUP_TOKEN ortam değişkeni ayarlanmamış!"
  echo ""
  echo "Lütfen önce token'ı ayarlayın:"
  echo "  export ADMIN_CLEANUP_TOKEN='your-secret-token'"
  exit 1
fi

# Onay iste (production için)
if [ "$PRODUCTION" = "true" ] && [ "$DRY_RUN" = "false" ]; then
  echo "⚠️  UYARI: Production veritabanında temizlik yapacaksınız!"
  echo ""
  read -p "Devam etmek istediğinizden emin misiniz? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "İşlem iptal edildi."
    exit 0
  fi
fi

# API'yi çağır
echo "🧹 Demo veri temizleme başlatılıyor..."
echo "   Base URL: $BASE_URL"
echo "   Dry Run: $DRY_RUN"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/cleanup-demo-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_CLEANUP_TOKEN" \
  -d "{
    \"deleteInactiveCompanies\": true,
    \"deleteTestBusinessOwners\": true,
    \"dryRun\": $DRY_RUN
  }")

# Sonuçları göster
echo "$RESPONSE" | jq '.'

# Başarı kontrolü
if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  echo ""
  if [ "$DRY_RUN" = "true" ]; then
    echo "✅ Dry run tamamlandı. Hiçbir veri silinmedi."
  else
    echo "✅ Temizlik başarıyla tamamlandı!"
  fi
else
  echo ""
  echo "❌ Temizlik başarısız oldu!"
  exit 1
fi

