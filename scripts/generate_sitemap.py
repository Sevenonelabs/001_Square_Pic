import os
from datetime import datetime

# Compute workspace path dynamically relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
dir_path = os.path.dirname(script_dir)
base_url = "https://squarepic.io/"

# Identify all HTML files
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

sitemap_template = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""

url_entry = """  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>"""

today = datetime.now().strftime('%Y-%m-%d')
entries = []

for file in html_files:
    # Clean URLs: remove .html extension
    name = file.replace('.html', '')
    
    if name == 'index':
        loc = base_url
        priority = "1.0"
    else:
        loc = base_url + name
        priority = "0.8"
        
    entries.append(url_entry.format(loc=loc, lastmod=today, priority=priority))

sitemap_content = sitemap_template.format(urls="\n".join(entries))

with open(os.path.join(dir_path, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print(f"Generated clean sitemap.xml with {len(html_files)} URLs")
