import os
import re

# Compute workspace path dynamically relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
dir_path = os.path.dirname(script_dir)

# Regex patterns for the hardcoded build assets
main_script_pattern = re.compile(r'<script type="module" crossorigin src="/assets/main-[A-Za-z0-9_-]+\.js"></script>')
compressor_script_pattern = re.compile(r'<script type="module" crossorigin src="/assets/free-image-compressor-[A-Za-z0-9_-]+\.js"></script>')
converter_script_pattern = re.compile(r'<script type="module" crossorigin src="/assets/free-image-converter-[A-Za-z0-9_-]+\.js"></script>')

# Pattern for stylesheet and preload tags referencing /assets/
css_pattern = re.compile(r'<link rel="stylesheet" crossorigin href="/assets/[A-Za-z0-9_-]+\.css">')
preload_pattern = re.compile(r'<link rel="modulepreload" crossorigin href="/assets/[A-Za-z0-9_-]+\.js">')

# Pattern for fixing internal links (removing .html)
html_link_pattern = re.compile(r'href="([^"]+)\.html"')

files_fixed = 0

for filename in os.listdir(dir_path):
    if filename.endswith(".html"):
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace build assets with source files
        new_content = main_script_pattern.sub('<script type="module" src="/src/main.ts"></script>', content)
        new_content = compressor_script_pattern.sub('<script type="module" src="/src/compressor.ts"></script>', new_content)
        new_content = converter_script_pattern.sub('<script type="module" src="/src/converter.ts"></script>', new_content)
        
        # Remove built CSS link tags and preload tags
        new_content = css_pattern.sub('', new_content)
        new_content = preload_pattern.sub('', new_content)
        
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
