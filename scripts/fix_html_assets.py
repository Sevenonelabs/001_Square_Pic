import os
import re

dir_path = r"c:\Users\shiva\Documents\Google AG\01_Seven_One_Labs\01_SquarePic_Final\Phase 1"

# Regex patterns for the hardcoded build assets
script_pattern = re.compile(r'<script type="module" crossorigin src="/assets/main-[A-Za-z0-9_-]+\.js"></script>')
link_pattern = re.compile(r'<link rel="stylesheet" crossorigin href="/assets/main-[A-Za-z0-9_-]+\.css">')

# Pattern for fixing internal links (removing .html)
html_link_pattern = re.compile(r'href="([^"]+)\.html"')

files_fixed = 0

for filename in os.listdir(dir_path):
    if filename.endswith(".html"):
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace build assets
        # We replace the script and remove the link because main.ts imports style.css
        new_content = script_pattern.sub('<script type="module" src="/src/main.ts"></script>', content)
        new_content = link_pattern.sub('', new_content)
        
        # Clean internal links (e.g. about.html -> about)
        # We avoid touching external links by checking for http/https
        def clean_link(match):
            link = match.group(1)
            if link.startswith('http') or link.startswith('//'):
                return match.group(0)
            if link == 'index':
                return 'href="/"'
            return f'href="{link}"'

        new_content = html_link_pattern.sub(clean_link, new_content)
        
        # Also handle specific cases where it might just be "index.html"
        new_content = new_content.replace('href="index.html"', 'href="/"')
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            files_fixed += 1
            print(f"Fixed {filename}")

print(f"Total files fixed: {files_fixed}")
