import os
import re

dir_path = r"c:\Users\shiva\Documents\Google AG\01_Seven_One_Labs\01_SquarePic_Final\Phase 1"

# Updated to use Clean URLs (no .html extension)
new_section = """    <section class="seo-links-bar">
      <div class="seo-category">
        <span class="seo-category-title">Core Tools</span>
        <div class="seo-category-links">
          <a href="square-image-tool">Square Image Tool</a>
          <a href="image-resizer">Image Resizer</a>
          <a href="photo-cropper">Photo Cropper</a>
          <a href="image-compressor">Image Compressor</a>
          <a href="resize-image-without-losing-quality">High Quality Resizer</a>
          <a href="free-online-photo-resizer">Free Photo Resizer</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Social Media Resizers</span>
        <div class="seo-category-links">
          <a href="instagram-photo-resizer">Instagram Resizer</a>
          <a href="instagram-story-resizer">IG Story Resizer</a>
          <a href="instagram-square-photo">IG Square Photo</a>
          <a href="instagram-reels-cover-maker">IG Reels Cover</a>
          <a href="facebook-post-image-resizer">FB Post Resizer</a>
          <a href="facebook-cover-photo-resizer">FB Cover Resizer</a>
          <a href="twitter-header-resizer">X Header Resizer</a>
          <a href="linkedin-banner-resizer">LinkedIn Banner Resizer</a>
          <a href="website-banner-resizer">Website Banner Resizer</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Profile Picture Makers</span>
        <div class="seo-category-links">
          <a href="profile-picture-maker">Profile Pic Maker</a>
          <a href="facebook-profile-picture-maker">FB Profile Pic</a>
          <a href="tiktok-profile-picture-maker">TikTok Profile Pic</a>
          <a href="youtube-profile-picture-maker">YT Profile Pic</a>
          <a href="twitch-profile-picture-maker">Twitch Profile Pic</a>
          <a href="linkedin-profile-picture-maker">LinkedIn Profile Pic</a>
          <a href="whatsapp-dp-maker">WhatsApp DP Maker</a>
          <a href="passport-photo-maker">Passport Photo Maker</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Creator Utilities</span>
        <div class="seo-category-links">
          <a href="youtube-thumbnail-resizer">YouTube Resizer</a>
          <a href="youtube-channel-art-resizer">YouTube Channel Art</a>
          <a href="twitch-banner-maker">Twitch Banner</a>
        </div>
      </div>
      <div class="seo-category">
        <span class="seo-category-title">Format Converters</span>
        <div class="seo-category-links">
          <a href="image-optimizer">Image Optimizer</a>
          <a href="image-converter">Image Converter</a>
          <a href="jpg-to-png">JPG to PNG</a>
          <a href="png-to-jpg">PNG to JPG</a>
          <a href="webp-to-png">WebP to PNG</a>
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
