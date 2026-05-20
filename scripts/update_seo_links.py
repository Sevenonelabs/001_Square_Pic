import os
import re

# Compute workspace path dynamically relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
dir_path = os.path.dirname(script_dir)

# Updated to use Clean URLs (no .html extension)
new_section = """    <section class="seo-links-bar">
      <div class="seo-category">
        <span class="seo-category-title">Core Tools</span>
        <div class="seo-category-links">
          <a href="index">Square Pic</a>
          <a href="free-square-image-tool">Square Image Tool</a>
          <a href="free-image-resizer">Image Resizer</a>
          <a href="free-photo-cropper">Photo Cropper</a>
          <a href="free-image-compressor">Image Compressor</a>
          <a href="free-resize-image-without-losing-quality">High Quality Resizer</a>
          <a href="free-online-photo-resizer">Free Photo Resizer</a>
          <a href="free-image-converter">Free Image Converter</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Social Media Resizers</span>
        <div class="seo-category-links">
          <a href="free-instagram-photo-resizer">Instagram Resizer</a>
          <a href="free-instagram-story-resizer">IG Story Resizer</a>
          <a href="free-instagram-square-photo">IG Square Photo</a>
          <a href="free-instagram-reels-cover-maker">IG Reels Cover</a>
          <a href="free-facebook-post-image-resizer">FB Post Resizer</a>
          <a href="free-facebook-cover-photo-resizer">FB Cover Resizer</a>
          <a href="free-twitter-header-resizer">X Header Resizer</a>
          <a href="free-linkedin-banner-resizer">LinkedIn Banner Resizer</a>
          <a href="free-website-banner-resizer">Website Banner Resizer</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Profile Picture Makers</span>
        <div class="seo-category-links">
          <a href="free-profile-picture-maker">Profile Pic Maker</a>
          <a href="free-facebook-profile-picture-maker">FB Profile Pic</a>
          <a href="free-tiktok-profile-picture-maker">TikTok Profile Pic</a>
          <a href="free-youtube-profile-picture-maker">YT Profile Pic</a>
          <a href="free-twitch-profile-picture-maker">Twitch Profile Pic</a>
          <a href="free-linkedin-profile-picture-maker">LinkedIn Profile Pic</a>
          <a href="free-whatsapp-dp-maker">WhatsApp DP Maker</a>
          <a href="free-passport-photo-maker">Passport Photo Maker</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Creator Utilities</span>
        <div class="seo-category-links">
          <a href="free-youtube-thumbnail-resizer">YouTube Resizer</a>
          <a href="free-youtube-channel-art-resizer">YouTube Channel Art</a>
          <a href="free-twitch-banner-maker">Twitch Banner</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Format Converters</span>
        <div class="seo-category-links">
          <a href="free-image-optimizer">Image Optimizer</a>
          <a href="free-image-converter">Free Image Converter</a>
          <a href="free-image-compressor">Image Compressor</a>
          <a href="free-jpg-to-png">JPG to PNG</a>
          <a href="free-png-to-jpg">PNG to JPG</a>
          <a href="free-webp-to-png">WebP to PNG</a>
        </div>
      </div>
    </section>"""

pattern = re.compile(r'<section class="seo-links-bar">.*?</section>', re.DOTALL)

for file in os.listdir(dir_path):
    if file.endswith('.html'):
        filepath = os.path.join(dir_path, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<section class="seo-links-bar">' in content:
            new_content = pattern.sub(new_section, content)
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
