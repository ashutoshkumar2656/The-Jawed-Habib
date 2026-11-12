import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://brandfetch.com/jawedhabib.co.in'

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print('Fetched HTML length:', len(html))
        # Look for asset URLs or JSON-LD or Next data
        next_data = re.findall(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
        if next_data:
            print('Found __NEXT_DATA__!')
            data = json.loads(next_data[0])
            # extract logos
            page_props = data.get('props', {}).get('pageProps', {})
            brand_data = page_props.get('brand', {})
            print('Brand name:', brand_data.get('name'))
            print('Logos:', json.dumps(brand_data.get('logos'), indent=2))
            print('Colors:', json.dumps(brand_data.get('colors'), indent=2))
        else:
            assets = re.findall(r'https://asset\.brandfetch\.io/[^"\'\s]+', html)
            print('Found asset URLs:', len(assets))
            for a in set(assets):
                print(' ', a)
except Exception as e:
    print('Error:', e)
