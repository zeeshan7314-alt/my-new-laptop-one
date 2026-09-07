#!/bin/bash
cd /home/user/webapp
for pass in 1 2 3 4 5 6; do
  echo "=== PASS $pass ==="
  python3 etl/fetch_images.py
  left=$(python3 -c "
import json,os
d=json.load(open('src/data/laptops.json'))
m=json.load(open('src/data/images.json')) if os.path.exists('src/data/images.json') else {}
print(sum(1 for l in d['laptops'] if l['slug'] not in m))")
  echo "remaining: $left"
  [ "$left" = "0" ] && break
  sleep 15
done
