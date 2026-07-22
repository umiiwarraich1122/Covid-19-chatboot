import urllib.request
import json
req = urllib.request.Request('http://127.0.0.1:8000/graphrag/compare', data=b'{"query": "vaccine"}', headers={'Content-Type': 'application/json'})
print(urllib.request.urlopen(req).read().decode())
