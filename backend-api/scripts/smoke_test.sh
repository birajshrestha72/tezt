#!/usr/bin/env bash
set -e
BASE=http://localhost:5040

echo "GET /api/reviews"
curl -s -o /tmp/reviews.json -w "HTTP_STATUS:%{http_code}\n" $BASE/api/reviews

echo
echo "LOGIN staff"
curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"staff1@vehicleparts.com","password":"Staff@2025"}' -o /tmp/staff_login.json -w "HTTP_STATUS:%{http_code}\n"
STAFF_TOKEN=$(python3 - <<'PY'
import sys,json
j=json.load(open('/tmp/staff_login.json'))
print(j.get('data',{}).get('token',''))
PY
)
echo "staff token: ${STAFF_TOKEN:0:20}..."

echo
echo "LOGIN admin"
curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@vehicleparts.com","password":"Admin@2025"}' -o /tmp/admin_login.json -w "HTTP_STATUS:%{http_code}\n"
ADMIN_TOKEN=$(python3 - <<'PY'
import sys,json
j=json.load(open('/tmp/admin_login.json'))
print(j.get('data',{}).get('token',''))
PY
)
echo "admin token: ${ADMIN_TOKEN:0:20}..."

echo
echo "GET /api/orders (staff)"
curl -s -H "Authorization: Bearer $STAFF_TOKEN" -o /tmp/orders.json -w "HTTP_STATUS:%{http_code}\n" $BASE/api/orders

echo
echo "CREATE customer (staff)"
curl -s -X POST $BASE/api/customers -H "Authorization: Bearer $STAFF_TOKEN" -H "Content-Type: application/json" -d '{"firstName":"Smoke","lastName":"Test","email":"smoke+1@example.com","phone":"000-111","vehicleNumber":"SMK-001","vehicleMake":"Test","vehicleModel":"X","vehicleYear":2020,"vehicleType":"Sedan"}' -o /tmp/create_customer.json -w "HTTP_STATUS:%{http_code}\n" $BASE/api/customers

echo
echo "REGISTER customer (anonymous)"
curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" -d '{"firstName":"Cust","lastName":"User","email":"smoke-cust@example.com","password":"Pass@1234","vehicleNumber":"SMK-002"}' -o /tmp/cust_reg.json -w "HTTP_STATUS:%{http_code}\n" $BASE/api/auth/register
CUST_TOKEN=$(python3 - <<'PY'
import sys,json
j=json.load(open('/tmp/cust_reg.json'))
print(j.get('data',{}).get('token',''))
PY
)
echo "cust token: ${CUST_TOKEN:0:20}..."

echo
echo "POST review (customer)"
curl -s -X POST $BASE/api/review -H "Authorization: Bearer $CUST_TOKEN" -H "Content-Type: application/json" -d '{"customerId":null,"rating":5,"comment":"Smoke test review"}' -o /tmp/review_create.json -w "HTTP_STATUS:%{http_code}\n" $BASE/api/review

echo
echo "GET financial report (admin)"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" -o /tmp/fin.json -w "HTTP_STATUS:%{http_code}\n" "$BASE/api/reports/financial?period=daily"

echo
for f in /tmp/reviews.json /tmp/staff_login.json /tmp/admin_login.json /tmp/orders.json /tmp/create_customer.json /tmp/cust_reg.json /tmp/review_create.json /tmp/fin.json; do
  echo "---- $f ----"
  head -n 1 $f || true
done
