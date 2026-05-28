#!/usr/bin/env bash
set -e
BASE=http://localhost:5040

# Login as staff and save response
curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"staff1@vehicleparts.com","password":"Staff@2025"}' -o /tmp/staff_login.json
STAFF_TOKEN=$(python3 - <<'PY'
import json
try:
    j=json.load(open('/tmp/staff_login.json'))
    print(j.get('data',{}).get('token',''))
except Exception:
    print('')
PY
)

if [ -z "$STAFF_TOKEN" ]; then
  echo "Failed to obtain staff token"
  exit 1
fi

echo "Using staff token: ${STAFF_TOKEN:0:20}..."

# Fetch customers and pick the first one
curl -s -H "Authorization: Bearer $STAFF_TOKEN" $BASE/api/customers -o /tmp/customers.json
CUSTOMER_ID=$(python3 - <<'PY'
import json
try:
    j=json.load(open('/tmp/customers.json'))
    items = j.get('data') or []
    print(items[0].get('id') if items else '')
except Exception:
    print('')
PY
)

if [ -z "$CUSTOMER_ID" ]; then
  echo "No customers found"
  exit 1
fi

echo "Selected customer id: $CUSTOMER_ID"

# Fetch products and pick the first product and price
curl -s -H "Authorization: Bearer $STAFF_TOKEN" $BASE/api/products -o /tmp/products.json
PRODUCT_ID=$(python3 - <<'PY'
import json
try:
    j=json.load(open('/tmp/products.json'))
    items = j.get('data') or []
    print(items[0].get('id') if items else '')
except Exception:
    print('')
PY
)

PRODUCT_PRICE=$(python3 - <<'PY'
import json
try:
    j=json.load(open('/tmp/products.json'))
    items = j.get('data') or []
    print(items[0].get('price') if items and items[0].get('price') is not None else 1000)
except Exception:
    print(1000)
PY
)

if [ -z "$PRODUCT_ID" ]; then
  echo "No products found"
  exit 1
fi

echo "Using product $PRODUCT_ID at price $PRODUCT_PRICE"

# Create 3 orders for the customer
for i in 1 2 3; do
  echo "Creating order #$i for customer $CUSTOMER_ID"
  PAYLOAD=$(cat <<JSON
{"items":[{"productId": $PRODUCT_ID, "quantity": 1, "unitPrice": $PRODUCT_PRICE}], "customerId": $CUSTOMER_ID, "amountPaid": 0}
JSON
)
  curl -s -X POST $BASE/api/orders -H "Authorization: Bearer $STAFF_TOKEN" -H "Content-Type: application/json" -d "$PAYLOAD" -o /tmp/order_$i.json -w "HTTP_STATUS:%{http_code}\n"
done

echo "Done."
