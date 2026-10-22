import os
import base64
import subprocess
import glob
import Quartz
from CoreFoundation import NSURL

BASE_DIR = "/Users/mohammednibrasulhaqq/Documents/Web/FOODORDER"
CLEAN_ASSETS_DIR = os.path.join(BASE_DIR, "mobile/assets/clean")
PITCH_DIR = os.path.join(BASE_DIR, "pitch-deck")
PREVIEW_DIR = os.path.join(PITCH_DIR, "pages_preview")
HTML_FILE = os.path.join(PITCH_DIR, "pitch_deck.html")
PDF_FILE = os.path.join(PITCH_DIR, "Alfiya_Kitchen_Pitch_Deck.pdf")

os.makedirs(PREVIEW_DIR, exist_ok=True)

def get_base64_image(filename):
    path = os.path.join(CLEAN_ASSETS_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            ext = filename.split(".")[-1].lower()
            mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"
            return f"data:{mime};base64,{encoded}"
    return ""

# Preload high-res clean images
img_hero = get_base64_image("gourmet_dining_hero.jpg")
img_feast = get_base64_image("feast_banner.jpg")
img_biryani = get_base64_image("dish_biryani.jpg")
img_butter_chicken = get_base64_image("dish_butter_chicken.jpg")
img_chicken_tikka = get_base64_image("dish_chicken_tikka.jpg")
img_burger = get_base64_image("food_cheeseburger.jpg")
img_pizza = get_base64_image("deal_pizza.jpg")
img_courier = get_base64_image("courier_hero.jpg")
img_tiramisu = get_base64_image("dish_tiramisu.jpg")
img_lava_cake = get_base64_image("dish_lava_cake.jpg")
img_flatbread = get_base64_image("dish_flatbread.jpg")
img_rogan_josh = get_base64_image("dish_rogan_josh.jpg")
img_avatar = get_base64_image("user_avatar.jpg")

print("Generating A4 Portrait HTML content for 16 slides...")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Alfiya Kitchen — Digital Food Ordering & Delivery Platform Pitch Deck (A4 Portrait)</title>
<style>
  @page {{
    size: 210mm 297mm;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  html, body {{
    background: #FAFAF7 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #19211B;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
  }}
  .slide {{
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    background: #FAFAF7;
    position: relative;
    page-break-after: always;
    break-after: page;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 13mm 14mm 10mm 14mm;
    margin: 0 auto;
    box-sizing: border-box;
  }}
  @media screen {{
    .slide {{
      margin: 20px auto;
      border: 1px solid #DCE5D8;
    }}
  }}
  @media print {{
    body {{ background: #FAFAF7 !important; }}
    .slide {{ margin: 0; border: none; }}
  }}

  /* Typography */
  .eyebrow {{
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1E6526;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .eyebrow-pill {{
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #1E6526;
  }}
  .slide-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    border-bottom: 1px solid #EAEFE7;
    padding-bottom: 8px;
  }}
  .slide-title-group h2 {{
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #131A14;
    line-height: 1.18;
  }}
  .slide-title-group p {{
    font-size: 11px;
    color: #556257;
    margin-top: 3px;
    line-height: 1.4;
    max-width: 530px;
  }}
  .brand-badge {{
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 9px;
    background: #FFFFFF;
    border: 1px solid #DCE5D8;
    border-radius: 16px;
    flex-shrink: 0;
  }}
  .brand-badge .logo-circle {{
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #1E6526;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 9.5px;
    font-weight: 900;
  }}
  .brand-badge span {{
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: #1E6526;
  }}

  /* Footer */
  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 7px;
    border-top: 1px solid #E5EDE2;
    font-size: 9.5px;
    color: #79887C;
  }}
  .slide-footer .left {{
    font-weight: 600;
    color: #38463B;
  }}
  .slide-footer .center {{
    color: #8C998E;
  }}
  .slide-footer .page-pill {{
    background: #EAF4EA;
    color: #1E6526;
    padding: 2px 7px;
    border-radius: 8px;
    font-weight: 700;
    border: 1px solid #D2E7D4;
  }}

  /* Cards & Utilities (Crisp vector borders, NO box-shadows to avoid Skia rasterization artifacts) */
  .card {{
    background: #FFFFFF;
    border: 1px solid #DCE5D8;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
  }}
  .card-highlight {{
    border: 1.5px solid #1E6526;
    background: #FDFEFD;
  }}
  .card-title {{
    font-size: 12.5px;
    font-weight: 700;
    color: #151F17;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .card-p {{
    font-size: 10.5px;
    color: #556358;
    line-height: 1.45;
  }}

  /* Icon Pill */
  .icon-pill {{
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #EAF4EB;
    color: #1E6526;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }}

  /* Badges */
  .tag {{
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2.5px 7px;
    border-radius: 4px;
  }}
  .tag-green {{ background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }}
  .tag-gold {{ background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }}
  .tag-blue {{ background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }}

  /* Phone Mockup Frame */
  .phone-frame {{
    width: 170px;
    height: 310px;
    background: #FFFFFF;
    border: 4px solid #1C231E;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    position: relative;
  }}
  .phone-notch {{
    width: 55px;
    height: 8px;
    background: #1C231E;
    border-radius: 0 0 6px 6px;
    align-self: center;
    margin-bottom: 2px;
  }}
  .phone-content {{
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 5px 7px;
    background: #FDFDFB;
  }}

  /* Browser Mockup Frame */
  .browser-frame {{
    background: #FFFFFF;
    border: 1px solid #D6DFD3;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }}
  .browser-header {{
    background: #F3F5F2;
    padding: 5px 8px;
    display: flex;
    align-items: center;
    gap: 5px;
    border-bottom: 1px solid #E1E7DF;
  }}
  .browser-dots {{
    display: flex;
    gap: 3.5px;
  }}
  .browser-dot {{
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
  }}
  .browser-url {{
    background: #FFFFFF;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 8.5px;
    color: #4B5563;
    border: 1px solid #DCE3D8;
    margin-left: 6px;
    flex: 1;
    max-width: 280px;
    font-family: monospace;
  }}

  /* Check list */
  .check-list {{
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 6px 0;
  }}
  .check-list li {{
    font-size: 10px;
    color: #38463B;
    display: flex;
    align-items: flex-start;
    gap: 5px;
    line-height: 1.35;
  }}
  .check-icon {{
    color: #1E6526;
    font-weight: 800;
    font-size: 10.5px;
  }}
</style>
</head>
<body>

<!-- ==========================================
     PAGE 1: COVER PAGE (A4 Portrait)
     ========================================== -->
<div class="slide" style="background: linear-gradient(180deg, #FAFAF7 0%, #F4F7F2 100%);">
  <!-- Top Brand Row -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 32px; height: 32px; border-radius: 8px; background: #1E6526; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 900; font-size: 15px;">AK</div>
      <div>
        <div style="font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #1E6526;">ALFIYA KITCHEN</div>
        <div style="font-size: 9px; color: #7B8B7D; letter-spacing: 0.6px;">CULINARY EXCELLENCE · DIGITAL SUITE</div>
      </div>
    </div>
    <div style="background: #EAF4EA; border: 1px solid #CCE5CD; padding: 4px 11px; border-radius: 16px; font-size: 9.5px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 5px;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22C55E;"></span>
      PROJECT PROPOSAL &amp; PITCH
    </div>
  </div>

  <!-- Main Title Area -->
  <div style="margin: 8px 0 4px 0;">
    <div class="eyebrow"><span class="eyebrow-pill"></span>PROPRIETARY RESTAURANT TECH ECOSYSTEM</div>
    <h1 style="font-size: 28px; font-weight: 800; color: #111A13; line-height: 1.15; letter-spacing: -0.6px; margin: 4px 0 8px 0;">
      DIGITAL FOOD ORDERING<br>
      <span style="color: #1E6526;">&amp; DELIVERY PLATFORM</span>
    </h1>
    <p style="font-size: 12px; color: #4B5A4E; line-height: 1.5; max-width: 520px;">
      A complete, direct-to-customer ordering experience built for modern restaurants. Reclaim your profit margins, own 100% of your diner relationships, and synchronize kitchen and delivery operations with a unified technology stack.
    </p>
  </div>

  <!-- Featured Visual Card -->
  <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 14px; overflow: hidden; margin: 4px 0;">
    <div style="height: 200px; position: relative;">
      <img src="{img_hero}" style="width: 100%; height: 100%; object-fit: cover;" alt="Alfiya Kitchen Culinary Dining">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(15,35,18,0.85) 100%);"></div>
      <div style="position: absolute; bottom: 10px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-end; color: #FFFFFF;">
        <div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #86EFAC; font-weight: 700;">Live Production Platform</div>
          <div style="font-size: 13px; font-weight: 800;">alfiya-kitchen.vercel.app</div>
        </div>
        <div style="background: rgba(255,255,255,0.95); color: #141E15; padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 700; display: flex; align-items: center; gap: 5px;">
          <span>🛵</span> Live Dispatch Ready
        </div>
      </div>
    </div>
  </div>

  <!-- 3 Impact Metric Badges -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 4px 0;">
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 8px; padding: 9px 12px;">
      <div style="font-size: 18px; font-weight: 800; color: #1E6526;">0%</div>
      <div style="font-size: 10px; color: #1E2820; font-weight: 700;">Aggregator Commissions</div>
      <div style="font-size: 8.5px; color: #627264; margin-top: 1px;">Save ₹25k–₹75k+ every month</div>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 8px; padding: 9px 12px;">
      <div style="font-size: 18px; font-weight: 800; color: #1E6526;">100%</div>
      <div style="font-size: 10px; color: #1E2820; font-weight: 700;">Customer Ownership</div>
      <div style="font-size: 8.5px; color: #627264; margin-top: 1px;">Direct phone &amp; order data</div>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 8px; padding: 9px 12px;">
      <div style="font-size: 18px; font-weight: 800; color: #1E6526;">Real-Time</div>
      <div style="font-size: 10px; color: #1E2820; font-weight: 700;">Cloud Synchronization</div>
      <div style="font-size: 8.5px; color: #627264; margin-top: 1px;">App, Web, Admin &amp; Couriers</div>
    </div>
  </div>

  <!-- Author Attribution Box -->
  <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 10px; padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: #738475;">PREPARED &amp; PRESENTED BY</div>
      <div style="font-size: 13px; font-weight: 800; color: #152017; margin-top: 1px;">Mohammed Nibrasul Haqq <br> Ahemed Rafeek </div>
      <div style="font-size: 10px; color: #556457;">Freelance Full-Stack Developers &amp; UI/UX Designers</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 9.5px; color: #1E6526; font-weight: 700;">nibrasulhaqqamini@gmail.com <br> ahemedrafeek1010@gmail.com</div>
      <div style="font-size: 8.5px; color: #7B8B7D; margin-top: 2px;">Direct Proposal · October 2026</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Strictly Confidential · Prepared for Restaurant Leadership</span>
    <span class="page-pill">Page 01 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 2: THE OPPORTUNITY (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>MARKET REALITY &amp; STRATEGIC SHIFT</div>
        <h2>Reclaim Margins, Customer Ownership &amp; Brand Equity</h2>
        <p>Restaurants increasingly require their own direct digital ordering infrastructure rather than sacrificing profits and diner relationships to third-party delivery aggregators.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- 4 Problem/Opportunity Cards in 2x2 Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
      <div class="card">
        <div class="icon-pill" style="margin-bottom: 6px; background: #FEE2E2; color: #991B1B;">%</div>
        <div class="card-title">Eliminate 20–30% Commissions</div>
        <div class="card-p">Third-party delivery platforms extract heavy commissions on every dish, eating into restaurant net margins. A self-owned platform keeps 100% of food revenue in your account.</div>
        <div style="margin-top: 8px; font-size: 9.5px; font-weight: 700; color: #991B1B;">Save ₹25,000–₹75,000+ monthly</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 6px; background: #E0E7FF; color: #3730A3;">👤</div>
        <div class="card-title">100% Customer Data Ownership</div>
        <div class="card-p">Aggregators mask customer identities and contact details. Owning your system gives you a direct database of verified diner phone numbers and ordering habits.</div>
        <div style="margin-top: 8px; font-size: 9.5px; font-weight: 700; color: #3730A3;">Direct SMS &amp; WhatsApp remarketing</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 6px; background: #FEF3C7; color: #92400E;">⚡</div>
        <div class="card-title">Instant Menu &amp; Deal Control</div>
        <div class="card-p">No waiting for third-party approval to adjust prices, toggle sold-out dishes, or introduce seasonal specials. Update your menu instantly in real time.</div>
        <div style="margin-top: 8px; font-size: 9.5px; font-weight: 700; color: #92400E;">Real-time stock &amp; price autonomy</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 6px; background: #DCFCE7; color: #166534;">🌟</div>
        <div class="card-title">Uncompromising Brand Loyalty</div>
        <div class="card-p">Customers connect directly with Alfiya Kitchen's unique identity rather than browsing competitor discounts on crowded delivery directories.</div>
        <div style="margin-top: 8px; font-size: 9.5px; font-weight: 700; color: #166534;">Build lifelong regular diners</div>
      </div>
    </div>

    <!-- Direct Comparison Table -->
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 10px; padding: 12px; margin-top: 6px;">
      <div style="font-size: 11px; font-weight: 800; color: #1F2A21; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        DIRECT COMPARISON: 3RD-PARTY AGGREGATORS VS. ALFIYA KITCHEN PLATFORM
      </div>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; font-size: 10px; border-bottom: 1px solid #EAEFE7; padding-bottom: 6px; font-weight: 700; color: #556457;">
        <div>Operational Parameter</div>
        <div>Aggregator Apps</div>
        <div style="color: #1E6526;">Alfiya Kitchen Platform</div>
      </div>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; font-size: 10px; padding: 6px 0; border-bottom: 1px solid #F1F5F0;">
        <div style="font-weight: 600; color: #2C382F;">Commission on Every Order</div>
        <div style="color: #DC2626; font-weight: 700;">20% – 30% per dish</div>
        <div style="color: #1E6526; font-weight: 800;">0% Commission</div>
      </div>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; font-size: 10px; padding: 6px 0; border-bottom: 1px solid #F1F5F0;">
        <div style="font-weight: 600; color: #2C382F;">Customer Contact &amp; Profiles</div>
        <div style="color: #DC2626; font-weight: 700;">Masked / Concealed</div>
        <div style="color: #1E6526; font-weight: 800;">100% Owned by You</div>
      </div>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; font-size: 10px; padding: 6px 0; border-bottom: 1px solid #F1F5F0;">
        <div style="font-weight: 600; color: #2C382F;">Payment Settlements</div>
        <div style="color: #6B7280;">Weekly payout holds</div>
        <div style="color: #1E6526; font-weight: 800;">Direct to Merchant Account</div>
      </div>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; font-size: 10px; padding: 6px 0;">
        <div style="font-weight: 600; color: #2C382F;">Customer Attention</div>
        <div style="color: #6B7280;">Surrounded by competitors</div>
        <div style="color: #1E6526; font-weight: 800;">100% Exclusive to Alfiya Kitchen</div>
      </div>
    </div>

    <!-- Summary Box -->
    <div style="background: #EAF4EA; border: 1px solid #C6E2C9; border-radius: 8px; padding: 10px 14px; margin-top: 10px; display: flex; align-items: center; gap: 10px;">
      <div style="font-size: 18px;">💡</div>
      <div style="font-size: 10.5px; color: #166534; line-height: 1.4;">
        <strong>Strategic Takeaway:</strong> Transitioning regular local orders to your own digital platform directly improves restaurant profitability while building permanent brand equity.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 01 · Business Opportunity &amp; Strategic Value</span>
    <span class="page-pill">Page 02 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 3: THE SOLUTION (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>THE COMPLETE SOLUTION</div>
        <h2>The Unified Alfiya Kitchen Digital Ecosystem</h2>
        <p>A closed-loop ordering, management, and fulfillment architecture connecting diners, kitchen staff, and delivery couriers in real time.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Visual Vertical Step Flowchart for A4 Portrait -->
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 10px; padding: 12px; margin: 8px 0;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
        SYNCHRONIZED ORDER LIFECYCLE FLOW
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 10px; background: #F8FBF8; border: 1px solid #D5E5D5; border-radius: 7px; padding: 8px 12px;">
          <div style="font-size: 18px;">📱</div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: 800; color: #1E6526;">1. CUSTOMER · Mobile App &amp; Website</div>
            <div style="font-size: 9.5px; color: #556457;">Discovers digital menu, selects food add-ons, builds cart, and confirms manual delivery address.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; background: #FAFAF8; border: 1px solid #E4EAE1; border-radius: 7px; padding: 8px 12px;">
          <div style="font-size: 18px;">💳</div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: 800; color: #141F16;">2. ORDERING ENGINE · Real-Time Validation &amp; Payment</div>
            <div style="font-size: 9.5px; color: #556457;">Validates pricing, verifies stock, executes secure payment (UPI/Card/COD), and isolates cart per account.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; background: #F8FBF8; border: 1px solid #D5E5D5; border-radius: 7px; padding: 8px 12px;">
          <div style="font-size: 18px;">🖥️</div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: 800; color: #1E6526;">3. RESTAURANT ADMIN · Kitchen Command Center</div>
            <div style="font-size: 9.5px; color: #556457;">Sounds instant audio alert, displays order itemization, tracks cooking status, and assigns delivery courier.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; background: #FAFAF8; border: 1px solid #E4EAE1; border-radius: 7px; padding: 8px 12px;">
          <div style="font-size: 18px;">🛵</div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: 800; color: #141F16;">4. DELIVERY COURIER · Dedicated Mobile Dispatch</div>
            <div style="font-size: 9.5px; color: #556457;">Reviews customer phone number and exact house/building details with 1-tap call and delivery confirmation.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; background: #EDF7EE; border: 1px solid #BFE0C3; border-radius: 7px; padding: 8px 12px;">
          <div style="font-size: 18px;">🏡</div>
          <div style="flex: 1;">
            <div style="font-size: 11px; font-weight: 800; color: #166534;">5. DOORSTEP · Fulfilled, Verified &amp; Customer Satisfied</div>
            <div style="font-size: 9.5px; color: #166534;">Food delivered hot and fresh; order status auto-updates to completed with digital receipt stored.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Core Technical Pillars -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">1</span>Unified Cloud Database Architecture</div>
        <div class="card-p">A single source of truth (PostgreSQL / Neon). Every dish price change, item availability toggle, and order placed on web or mobile app synchronizes to the Admin Panel without delay.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">2</span>Zero-Friction Island Checkout Design</div>
        <div class="card-p">Tailored specifically for local island logistics: diners submit exact house names, building landmarks, and contact numbers without GPS map bugs or inaccurate dropoff pins.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">3</span>Strict 3-Role Access Hierarchy</div>
        <div class="card-p">No confusing permissions or complex tiers. Exactly three dedicated interfaces: <strong>Admin</strong> (kitchen control), <strong>Customer</strong> (ordering &amp; profile), and <strong>Delivery Person</strong> (dispatch &amp; fulfillment).</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 02 · Ecosystem Overview &amp; Architecture</span>
    <span class="page-pill">Page 03 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 4: CUSTOMER MOBILE APP (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>PRIMARY ORDERING TOUCHPOINT</div>
        <h2>Customer Mobile App Experience</h2>
        <p>A modern smartphone application designed to give diners effortless food discovery, friction-free cart building, and transparent order tracking.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Mobile Mockup & Highlights Row -->
    <div style="display: grid; grid-template-columns: 165px 1fr; gap: 14px; align-items: center; margin: 6px 0;">
      <!-- Mobile Mockup Frame -->
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-size: 7.5px; font-weight: 800; color: #1E6526;">ALFIYA KITCHEN</div>
            <div style="font-size: 7.5px; background: #EAF4EA; padding: 1px 4px; border-radius: 4px; color: #166534; font-weight: 700;">30-40m</div>
          </div>
          <div style="height: 55px; border-radius: 5px; overflow: hidden; position: relative; margin-bottom: 4px;">
            <img src="{img_feast}" style="width: 100%; height: 100%; object-fit: cover;" alt="Banner">
            <div style="position: absolute; bottom: 2px; left: 4px; color: #FFFFFF; font-size: 7.5px; font-weight: 800;">Weekend Biryani Special</div>
          </div>
          <div style="display: flex; gap: 2px; margin-bottom: 4px;">
            <span style="font-size: 6.5px; background: #1E6526; color: #FFF; padding: 2px 4px; border-radius: 3px; font-weight: 700;">Biryani</span>
            <span style="font-size: 6.5px; background: #F1F4F0; color: #4B5563; padding: 2px 4px; border-radius: 3px;">Curries</span>
            <span style="font-size: 6.5px; background: #F1F4F0; color: #4B5563; padding: 2px 4px; border-radius: 3px;">Grill</span>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E5EBE3; border-radius: 5px; padding: 3px; display: flex; gap: 4px; margin-bottom: 3px; align-items: center;">
            <img src="{img_biryani}" style="width: 28px; height: 28px; border-radius: 4px; object-fit: cover;" alt="Biryani">
            <div style="flex: 1;">
              <div style="font-size: 7px; font-weight: 700; color: #151F17;">Malabar Dum Biryani</div>
              <div style="font-size: 6.5px; color: #1E6526; font-weight: 800;">₹480</div>
            </div>
            <span style="background: #1E6526; color: #FFF; font-size: 7px; font-weight: 700; padding: 1px 4px; border-radius: 2px;">ADD</span>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E5EBE3; border-radius: 5px; padding: 3px; display: flex; gap: 4px; align-items: center;">
            <img src="{img_butter_chicken}" style="width: 28px; height: 28px; border-radius: 4px; object-fit: cover;" alt="Curry">
            <div style="flex: 1;">
              <div style="font-size: 7px; font-weight: 700; color: #151F17;">Butter Chicken Roast</div>
              <div style="font-size: 6.5px; color: #1E6526; font-weight: 800;">₹420</div>
            </div>
            <span style="background: #1E6526; color: #FFF; font-size: 7px; font-weight: 700; padding: 1px 4px; border-radius: 2px;">ADD</span>
          </div>
          <div style="margin-top: auto; background: #1E6526; border-radius: 5px; padding: 3px 5px; color: #FFF; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 7px; font-weight: 700;">2 items · ₹900</div>
            <div style="font-size: 7px; font-weight: 800;">Cart ➔</div>
          </div>
        </div>
      </div>

      <!-- Feature Columns -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="card" style="padding: 10px;">
          <div class="card-title"><span class="icon-pill">🏠</span>Home &amp; Culinary Discovery</div>
          <div class="card-p">Rich branding, rotating promotional banners, categorized menus (Biryani, Curries, Grills, Sweets), chef's recommendations, and quick reorder shortcuts.</div>
        </div>

        <div class="card" style="padding: 10px;">
          <div class="card-title"><span class="icon-pill">🛒</span>Smart Cart &amp; Clear Billing</div>
          <div class="card-p">Live price calculations, item customization notes, automatic delivery charges, promotional discounts, and transparent total breakdowns.</div>
        </div>

        <div class="card" style="padding: 10px; background: #F8FCF8; border-color: #B2D8B8;">
          <div class="card-title"><span class="icon-pill" style="background: #DCFCE7; color: #166534;">📍</span>Island Manual Address Clarity</div>
          <div class="card-p"><strong>No live-location / GPS map hassle.</strong> Customers enter specific house names, apartment details, local landmarks, and phone numbers for error-free local delivery.</div>
        </div>
      </div>
    </div>

    <!-- Bottom Features: Tracking & Profile -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">⏱️</span>Live Order Tracking</div>
        <div class="card-p">Visual 5-stage progress indicator: <em>Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered</em>, keeping diners fully informed without calling the desk.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">👤</span>Personal Profile &amp; Reorder History</div>
        <div class="card-p">Diners save multiple delivery addresses (Home, Office, Relatives), review past culinary choices, reorder favorite meals in 1-tap, and view digital receipts.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 03 · Mobile Application Features &amp; User Experience</span>
    <span class="page-pill">Page 04 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 5: SMART CART & ACCOUNT SECURITY (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>ACCOUNT-SCOPED INTEGRITY</div>
        <h2>Smart Cart &amp; Account Isolation Architecture</h2>
        <p>A dependable, client-centric data architecture ensuring every customer's cart, addresses, and order history remain strictly tied to their authenticated profile.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Core Takeaway Banner -->
    <div style="background: #FFFFFF; border: 1.5px solid #1E6526; border-radius: 10px; padding: 12px 16px; text-align: center; margin: 8px 0;">
      <span class="tag tag-green" style="font-size: 9.5px; padding: 3px 10px;">CUSTOMER BENEFIT PRINCIPLE</span>
      <h3 style="font-size: 15px; font-weight: 800; color: #121F14; margin-top: 5px;">
        "Your cart stays connected to your account — never the physical device."
      </h3>
    </div>

    <!-- Isolation Visual Diagram -->
    <div style="background: #FFFFFF; border: 1px solid #DCE5D8; border-radius: 10px; padding: 12px; margin: 6px 0;">
      <div style="font-size: 10px; font-weight: 800; color: #556457; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; text-align: center;">
        ISOLATION ON SHARED FAMILY OR WORK DEVICES
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <!-- Account A -->
        <div style="background: #F8FBF8; border: 1.5px solid #C4DFC7; border-radius: 8px; padding: 10px;">
          <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 6px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #1E6526; color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">A</div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #162218;">Customer Account A</div>
              <div style="font-size: 9px; color: #5B6D5E;">Ahmed · +91 98765 43210</div>
            </div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #D5E2D3; border-radius: 6px; padding: 6px 8px; font-size: 9.5px;">
            <div style="font-weight: 700; color: #1E6526; margin-bottom: 2px;">Dedicated Cart A (2 items)</div>
            <div style="color: #4B5563;">• 1x Malabar Dum Biryani (₹480)</div>
            <div style="color: #4B5563;">• 1x Butter Chicken Roast (₹420)</div>
            <div style="font-weight: 700; color: #162218; margin-top: 3px; border-top: 1px dashed #E0E7DC; padding-top: 2px;">Subtotal: ₹900</div>
          </div>
        </div>

        <!-- Account B -->
        <div style="background: #FDF9F3; border: 1.5px solid #EED8B6; border-radius: 8px; padding: 10px;">
          <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 6px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #C28E2E; color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">B</div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #221D16;">Customer Account B</div>
              <div style="font-size: 9px; color: #6D635B;">Fatima · +91 91234 56789</div>
            </div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #EAE0D3; border-radius: 6px; padding: 6px 8px; font-size: 9.5px;">
            <div style="font-weight: 700; color: #C28E2E; margin-bottom: 2px;">Dedicated Cart B (1 item)</div>
            <div style="color: #4B5563;">• 1x Cheeseburger Combo (₹360)</div>
            <div style="color: #4B5563;">• 1x Chilled Mango Smoothie (₹140)</div>
            <div style="font-weight: 700; color: #221D16; margin-top: 3px; border-top: 1px dashed #EADFD2; padding-top: 2px;">Subtotal: ₹500</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 8px; font-size: 9.5px; color: #1E6526; font-weight: 700;">
        ⚡ Same smartphone / tablet ➔ Complete cart and profile isolation with zero data contamination.
      </div>
    </div>

    <!-- 3 Core Reliability Pillars -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">🛡️</span>Zero Cross-Contamination</div>
        <div class="card-p">When one family member signs out and another logs in, their cart items are instantly swapped. No accidental item mixing, phantom charges, or erroneous food orders.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">🔄</span>Persistent Cart Recall</div>
        <div class="card-p">A customer can build their meal at noon, close the app or switch devices, and find their complete cart preserved when finalizing dinner hours later.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">🔒</span>Private Order History &amp; Addresses</div>
        <div class="card-p">Delivery addresses, house names, and past food receipts remain strictly confidential and accessible only to the authenticated account holder.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 04 · Data Reliability &amp; Customer Trust</span>
    <span class="page-pill">Page 05 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 6: ONLINE PAYMENT & CHECKOUT (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>MONETIZATION &amp; CASH FLOW</div>
        <h2>Secure Online Payments &amp; Gateway Flexibility</h2>
        <p>Offer diners modern, frictionless payment methods while retaining direct merchant settlement into Alfiya Kitchen's bank account.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Supported Methods Grid -->
    <div class="card" style="margin: 6px 0;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
        COMPREHENSIVE PAYMENT METHODS SUPPORTED
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="background: #F7FAF7; border: 1px solid #DCE7DC; border-radius: 7px; padding: 7px 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #152217;">⚡ UPI Payments</div>
          <div style="font-size: 9px; color: #556457; margin-top: 1px;">Google Pay, PhonePe, Paytm, BHIM &amp; QR intent.</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DCE7DC; border-radius: 7px; padding: 7px 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #152217;">💳 Debit &amp; Credit Cards</div>
          <div style="font-size: 9px; color: #556457; margin-top: 1px;">Visa, Mastercard, RuPay &amp; American Express.</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DCE7DC; border-radius: 7px; padding: 7px 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #152217;">🏦 Net Banking</div>
          <div style="font-size: 9px; color: #556457; margin-top: 1px;">Direct bank transfers across 50+ major institutions.</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DCE7DC; border-radius: 7px; padding: 7px 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #152217;">💵 Cash on Delivery (COD)</div>
          <div style="font-size: 9px; color: #556457; margin-top: 1px;">Configurable admin toggle to enable or disable COD.</div>
        </div>
      </div>
    </div>

    <!-- Gateway Independence Note -->
    <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 9px 12px; margin: 4px 0;">
      <div style="font-size: 10px; font-weight: 800; color: #92400E; display: flex; align-items: center; gap: 5px;">
        <span>ℹ️</span> GATEWAY INDEPENDENCE &amp; COMMERCIAL FREEDOM
      </div>
      <div style="font-size: 9.5px; color: #78350F; line-height: 1.35; margin-top: 2px;">
        The platform features an open payment abstraction. Integration is executed with the restaurant's preferred provider (e.g., Razorpay, PhonePe PG, Cashfree, or Paytm) according to local merchant approval.
      </div>
    </div>

    <!-- Step-by-Step Flow -->
    <div class="card" style="margin-top: 6px;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        END-TO-END PAYMENT &amp; ORDER CONVERSION FLOW
      </div>

      <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; align-items: center; gap: 8px; background: #FAFAF7; border: 1px solid #E6ECE4; border-radius: 6px; padding: 6px 10px;">
          <div class="icon-pill" style="width: 20px; height: 20px; font-size: 9.5px;">1</div>
          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: #162217;">Customer Checkout</div>
            <div style="font-size: 9px; color: #5B6D5E;">Reviews itemized cart, delivery address, and total amount.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #FAFAF7; border: 1px solid #E6ECE4; border-radius: 6px; padding: 6px 10px;">
          <div class="icon-pill" style="width: 20px; height: 20px; font-size: 9.5px;">2</div>
          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: #162217;">Payment Method Selection</div>
            <div style="font-size: 9px; color: #5B6D5E;">Chooses UPI intent, Card, Net Banking, or Cash on Delivery.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #FAFAF7; border: 1px solid #E6ECE4; border-radius: 6px; padding: 6px 10px;">
          <div class="icon-pill" style="width: 20px; height: 20px; font-size: 9.5px;">3</div>
          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: #162217;">Certified Gateway Processing</div>
            <div style="font-size: 9px; color: #5B6D5E;">Encrypted bank-grade authorization with instant response.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #FAFAF7; border: 1px solid #E6ECE4; border-radius: 6px; padding: 6px 10px;">
          <div class="icon-pill" style="width: 20px; height: 20px; font-size: 9.5px;">4</div>
          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: #162217;">Automated Order Creation</div>
            <div style="font-size: 9px; color: #5B6D5E;">Verified order instantly registers into the restaurant database.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; background: #EDF7EE; border: 1px solid #B8E0BC; border-radius: 6px; padding: 6px 10px;">
          <div class="icon-pill" style="width: 20px; height: 20px; font-size: 9.5px; background: #1E6526; color: #FFF;">5</div>
          <div>
            <div style="font-size: 10.5px; font-weight: 800; color: #166534;">Instant Admin &amp; Kitchen Alert</div>
            <div style="font-size: 9px; color: #166534;">Kitchen sounds audio alert and starts preparation immediately.</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 05 · Payment Processing &amp; Cash Flow Security</span>
    <span class="page-pill">Page 06 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 7: RESTAURANT ADMIN DASHBOARD (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>OPERATIONAL COMMAND</div>
        <h2>Restaurant Admin Dashboard &amp; Order Stream</h2>
        <p>A centralized operations console giving kitchen managers total real-time control over orders, cooking statuses, customer details, and courier assignments.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Admin Mockup View -->
    <div class="browser-frame" style="margin: 6px 0;">
      <div class="browser-header">
        <div class="browser-dots">
          <div class="browser-dot" style="background: #EF4444;"></div>
          <div class="browser-dot" style="background: #F59E0B;"></div>
          <div class="browser-dot" style="background: #10B981;"></div>
        </div>
        <div class="browser-url">https://alfiya-kitchen.vercel.app/admin/orders</div>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 8.5px; font-weight: 700; color: #1E6526;">
          <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #22C55E;"></span>
          Real-Time Sync
        </div>
      </div>

      <div style="padding: 8px 10px; background: #FAFBF9;">
        <!-- Order Pipeline Status Cards (Stacked rows for portrait) -->
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div style="background: #FFFFFF; border: 1px solid #E1E8DE; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="tag tag-gold" style="font-size: 7.5px;">PENDING (1)</span>
              <span style="font-size: 10px; font-weight: 800; color: #162218; margin-left: 6px;">#AK-2492 · ₹640 (UPI)</span>
              <div style="font-size: 8.5px; color: #526054;">Mohd. Rafeek · Baitul Noor · 2 mins ago</div>
            </div>
            <button style="background: #1E6526; color: #FFF; font-size: 8.5px; font-weight: 700; border: none; padding: 3px 8px; border-radius: 4px;">Confirm ➔</button>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E1E8DE; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="tag tag-blue" style="font-size: 7.5px;">PREPARING (2)</span>
              <span style="font-size: 10px; font-weight: 800; color: #162218; margin-left: 6px;">#AK-2491 · ₹900 (Paid)</span>
              <div style="font-size: 8.5px; color: #526054;">Zainab K. · Green Villa · 2x Malabar Dum Biryani</div>
            </div>
            <span style="font-size: 8.5px; color: #0284C7; font-weight: 700;">In Kitchen (12m left)</span>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E1E8DE; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="tag tag-gold" style="font-size: 7.5px;">DISPATCHED (2)</span>
              <span style="font-size: 10px; font-weight: 800; color: #162218; margin-left: 6px;">#AK-2490 · ₹480</span>
              <div style="font-size: 8.5px; color: #526054;">Assigned: Courier Irshad Ali (Out for Delivery)</div>
            </div>
            <span style="font-size: 8.5px; color: #D97706; font-weight: 700;">On Route</span>
          </div>

          <div style="background: #F7FCF7; border: 1px solid #DAEEDA; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="tag tag-green" style="font-size: 7.5px;">DELIVERED (18)</span>
              <span style="font-size: 10px; font-weight: 800; color: #166534; margin-left: 6px;">#AK-2489 · ₹1,120</span>
              <div style="font-size: 8.5px; color: #166534;">Delivered to South Jetty Road · 15 mins ago</div>
            </div>
            <span style="font-size: 8.5px; color: #166534; font-weight: 700;">✓ Completed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Core Admin Capabilities -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">⚡</span>1-Click Status Transitions</div>
        <div class="card-p">Single click moves an order from Confirmed to Preparing, Dispatched, or Delivered, immediately updating the customer's mobile app screen in real time.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">📍</span>Full Customer Intel &amp; Island Address</div>
        <div class="card-p">Every order reveals customer phone number, house/building name, specific landmark, item quantities, payment verification, and special cooking instructions.</div>
      </div>
      <div class="card" style="padding: 10px 12px;">
        <div class="card-title"><span class="icon-pill">🛵</span>Direct Delivery Driver Assignment</div>
        <div class="card-p">Assign dispatched parcels directly to active restaurant delivery personnel with immediate notification to their mobile dispatch screen.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 06 · Operations Console &amp; Order Pipeline</span>
    <span class="page-pill">Page 07 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 8: DYNAMIC MENU MANAGEMENT (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>MENU CONTROL &amp; AUTONOMY</div>
        <h2>Dynamic Menu, Pricing &amp; Inventory Management</h2>
        <p>Take complete control over your culinary offerings without writing code. Modify items, prices, and availability with instant cross-platform synchronization.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- 4 Feature Cards with Real Food Photos in 2x2 Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0;">
      <div class="card">
        <div style="height: 70px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; position: relative;">
          <img src="{img_biryani}" style="width: 100%; height: 100%; object-fit: cover;" alt="Biryani">
          <span class="tag tag-green" style="position: absolute; top: 4px; right: 4px; font-size: 7.5px;">Available</span>
        </div>
        <div class="card-title">Instant Stock Toggle</div>
        <div class="card-p">Ran out of Biryani during peak rush? Toggle off availability with 1 click to prevent disappointed diners. App &amp; web update instantly.</div>
      </div>

      <div class="card">
        <div style="height: 70px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; position: relative;">
          <img src="{img_butter_chicken}" style="width: 100%; height: 100%; object-fit: cover;" alt="Curry">
          <span class="tag tag-gold" style="position: absolute; top: 4px; right: 4px; font-size: 7.5px;">Best Seller</span>
        </div>
        <div class="card-title">Dynamic Pricing Control</div>
        <div class="card-p">Adjust dish prices on the fly as ingredient costs fluctuate. Update combo offers, festival platters, and seasonal specials without external delays.</div>
      </div>

      <div class="card">
        <div style="height: 70px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; position: relative;">
          <img src="{img_pizza}" style="width: 100%; height: 100%; object-fit: cover;" alt="Pizza">
          <span class="tag tag-blue" style="position: absolute; top: 4px; right: 4px; font-size: 7.5px;">Promoted</span>
        </div>
        <div class="card-title">Deals &amp; Banners</div>
        <div class="card-p">Upload promotional hero banners and configure "Chef's Specials" directly to the top of the customer mobile home feed to drive high-margin dishes.</div>
      </div>

      <div class="card">
        <div style="height: 70px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; position: relative;">
          <img src="{img_tiramisu}" style="width: 100%; height: 100%; object-fit: cover;" alt="Dessert">
          <span class="tag tag-green" style="position: absolute; top: 4px; right: 4px; font-size: 7.5px;">Category</span>
        </div>
        <div class="card-title">Category Architecture</div>
        <div class="card-p">Organize your menu into clean categories (Breakfast, Biryani, Curries, Grills, Sweets, Beverages) for effortless diner navigation.</div>
      </div>
    </div>

    <!-- Zero Dependency Guarantee Banner -->
    <div style="background: #FFFFFF; border: 1.5px solid #1E6526; border-radius: 9px; padding: 11px 14px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: #132015;">Zero Hardcoded Dependency · 100% Admin Controlled</div>
        <div style="font-size: 9.5px; color: #536456; margin-top: 2px;">Any staff member can add dishes, upload appetizing photos, and modify prices in under 60 seconds.</div>
      </div>
      <div style="background: #EAF4EA; border: 1px solid #B8DCBD; color: #166534; font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 6px; flex-shrink: 0;">
        Zero Maintenance Fees
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 07 · Dynamic Menu &amp; Inventory Management</span>
    <span class="page-pill">Page 08 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 9: DELIVERY PERSON SYSTEM (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>STREAMLINED LOGISTICS</div>
        <h2>Dedicated Delivery Portal for Local Fulfillment</h2>
        <p>A fast, lightweight interface tailored for couriers navigating local island routes, featuring direct phone dialing, clear house details, and zero battery-draining GPS overhead.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Active Courier Screen Card Mockup -->
    <div class="card" style="margin: 6px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAEFE7; padding-bottom: 6px;">
        <div>
          <div style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 800; color: #1E6526;">ACTIVE COURIER DISPATCH VIEW</div>
          <div style="font-size: 12px; font-weight: 800; color: #141F16;">Courier: Irshad Ali</div>
        </div>
        <span class="tag tag-green">2 Orders Assigned</span>
      </div>

      <div style="background: #F8FBF8; border: 1.5px solid #CDE2CF; border-radius: 8px; padding: 9px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #152217;">Order #AK-2490 · ₹480 (Paid UPI)</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #1E6526; margin-top: 1px;">Customer: Mohammed Rafeek</div>
          </div>
          <span style="background: #1E6526; color: #FFFFFF; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 5px;">📞 Call Diner</span>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #D9E4D7; border-radius: 6px; padding: 6px 8px; margin-top: 6px; font-size: 9px;">
          <div style="font-weight: 700; color: #364438;">📍 Exact Local Delivery Address:</div>
          <div style="color: #19231A; font-weight: 600;">Baitul Noor, 2nd Floor · Near Bismillah Stores</div>
          <div style="color: #617163;">South Jetty Road, Amini Island · +91 98765 43210</div>
        </div>

        <div style="display: flex; gap: 6px; margin-top: 7px;">
          <button style="flex: 1; background: #FFFFFF; border: 1px solid #B7D9BA; color: #1E6526; font-size: 9px; font-weight: 700; padding: 4px; border-radius: 4px;">✓ Picked Up</button>
          <button style="flex: 1; background: #1E6526; border: none; color: #FFFFFF; font-size: 9px; font-weight: 700; padding: 4px; border-radius: 4px;">✓ Mark Delivered</button>
        </div>
      </div>
    </div>

    <!-- 4 Operational Pillars in 2x2 Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">👥</span>Strict 3 Roles Only</div>
        <div class="card-p">Exactly three clean roles: <strong>Admin</strong> (kitchen), <strong>Customer</strong> (ordering), and <strong>Delivery Person</strong> (dispatch). No confusing user tiers.</div>
      </div>

      <div class="card" style="padding: 10px; background: #F8FCF8; border-color: #B2D8B8;">
        <div class="card-title"><span class="icon-pill" style="background: #DCFCE7; color: #166534;">🚀</span>Zero GPS Overhead</div>
        <div class="card-p"><strong>No live GPS tracking requirement.</strong> Couriers do not suffer from battery drain, dropped map signals, or inaccurate satellite pins on island routes.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">📞</span>1-Tap Direct Calling</div>
        <div class="card-p">Couriers tap the direct call button to verify house location or confirm gate access before arriving, eliminating missed deliveries.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">📱</span>Any Phone Compatible</div>
        <div class="card-p">Lightweight web application that runs effortlessly on any budget Android or iOS smartphone without requiring hefty app installations.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 08 · Logistics &amp; Delivery Management</span>
    <span class="page-pill">Page 09 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 10: RESTAURANT WEBSITE (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>PUBLIC DIGITAL PRESENCE</div>
        <h2>High-Converting Restaurant Ordering Website</h2>
        <p>The public digital face of Alfiya Kitchen, turning internet browsers, tourist inquiries, and local searchers into direct paying diners across all devices.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Live Website Browser Mockup -->
    <div class="browser-frame" style="margin: 6px 0;">
      <div class="browser-header">
        <div class="browser-dots">
          <div class="browser-dot" style="background: #EF4444;"></div>
          <div class="browser-dot" style="background: #F59E0B;"></div>
          <div class="browser-dot" style="background: #10B981;"></div>
        </div>
        <div class="browser-url">https://alfiya-kitchen.vercel.app/</div>
        <div style="margin-left: auto; font-size: 8.5px; font-weight: 700; color: #1E6526; background: #EAF4EA; padding: 2px 7px; border-radius: 4px;">
          LIVE REFERENCE
        </div>
      </div>

      <!-- Banner and Web Ordering Showcase -->
      <div style="height: 140px; position: relative;">
        <img src="{img_feast}" style="width: 100%; height: 100%; object-fit: cover;" alt="Alfiya Kitchen Feast">
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,35,18,0.85) 100%);"></div>
        <div style="position: absolute; bottom: 10px; left: 14px; right: 14px; color: #FFFFFF;">
          <div style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #86EFAC; font-weight: 700;">WELCOME TO ALFIYA KITCHEN</div>
          <div style="font-size: 14px; font-weight: 800;">Exquisite Dining &amp; Direct Home Delivery</div>
          <div style="font-size: 9px; color: #D1E7D4; margin-top: 2px;">Authentic Malabar Dum Biryani, tandoori grills, and local island specialties.</div>
        </div>
      </div>
    </div>

    <!-- 4 Value Features in 2x2 Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">🌐</span>Web Ordering</div>
        <div class="card-p">Diners who don't have the mobile app can browse, build a cart, and order directly on any web browser without installation barriers.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">📱</span>Fully Responsive</div>
        <div class="card-p">Pixel-perfect layout optimized across iPhones, Android devices, iPads, laptops, and desktop screens with fast page load times.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">🔍</span>Local SEO Power</div>
        <div class="card-p">Engineered for Google search visibility so tourists and residents searching for "best restaurant in Amini" discover Alfiya Kitchen first.</div>
      </div>

      <div class="card" style="padding: 10px;">
        <div class="card-title"><span class="icon-pill">📞</span>Direct Contact Hub</div>
        <div class="card-p">Prominently displays opening hours, dine-in table reservations, restaurant location directions, and click-to-call phone shortcuts.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 09 · Public Web Presence &amp; Conversion</span>
    <span class="page-pill">Page 10 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 11: SYSTEM ARCHITECTURE & DATA FLOW (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>SYSTEM ARCHITECTURE</div>
        <h2>The Unified Order &amp; Payment Ecosystem</h2>
        <p>An architectural blueprint illustrating how customer touchpoints, payment processing, kitchen operations, and delivery fulfillments synchronize seamlessly.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Architectural Lanes Stacked for A4 Portrait -->
    <div class="card" style="margin: 6px 0; padding: 10px 12px;">
      <!-- Lane 1: Diners -->
      <div style="border-bottom: 1px dashed #E2EADF; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-size: 10px; font-weight: 800; color: #1E6526; margin-bottom: 4px;">1. DINER TOUCHPOINTS</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="background: #F7FAF7; border: 1px solid #D6E4D4; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Mobile App (iOS / Android)</div>
            <div style="font-size: 8.5px; color: #5B6D5E;">Account-isolated cart &amp; manual address</div>
          </div>
          <div style="background: #F7FAF7; border: 1px solid #D6E4D4; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Responsive Web Storefront</div>
            <div style="font-size: 8.5px; color: #5B6D5E;">Direct browser orders &amp; menu discovery</div>
          </div>
        </div>
      </div>

      <!-- Lane 2: Payment & Validation -->
      <div style="border-bottom: 1px dashed #E2EADF; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-size: 10px; font-weight: 800; color: #C28E2E; margin-bottom: 4px;">2. PAYMENT &amp; SERVER VALIDATION</div>
        <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 6px;">
          <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #221B13;">Payment Gateway Hub (UPI / Cards / COD)</div>
            <div style="font-size: 8.5px; color: #6D635B;">Instant verification token returned to backend</div>
          </div>
          <div style="background: #F6F9F5; border: 1px solid #DAE6D7; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #166534;">Server-Side Validation</div>
            <div style="font-size: 8.5px; color: #5B6D5E;">Price audit &amp; stock verification</div>
          </div>
        </div>
      </div>

      <!-- Lane 3: Core Database -->
      <div style="border-bottom: 1px dashed #E2EADF; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-size: 10px; font-weight: 800; color: #0284C7; margin-bottom: 4px;">3. CENTRAL REAL-TIME DATABASE</div>
        <div style="background: #F0F8FE; border: 1px solid #CDE5FA; border-radius: 5px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0A304E;">Central PostgreSQL Production Database (Neon Cloud)</div>
            <div style="font-size: 8.5px; color: #4B6E88;">Single source of truth for Orders, Diners, Menu Items &amp; Courier Dispatches</div>
          </div>
          <span class="tag tag-blue" style="font-size: 8px;">Live Synchronized</span>
        </div>
      </div>

      <!-- Lane 4: Kitchen & Courier -->
      <div>
        <div style="font-size: 10px; font-weight: 800; color: #1E6526; margin-bottom: 4px;">4. FULFILLMENT &amp; DELIVERY</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="background: #F7FAF7; border: 1px solid #D6E4D4; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Restaurant Admin Command</div>
            <div style="font-size: 8.5px; color: #5B6D5E;">Audio alert, prep tracker, driver assignment</div>
          </div>
          <div style="background: #EDF7EE; border: 1px solid #BFE0C3; border-radius: 5px; padding: 5px 8px;">
            <div style="font-size: 10px; font-weight: 800; color: #166534;">Courier Mobile Dispatch</div>
            <div style="font-size: 8.5px; color: #166534;">Direct phone call, clear address, 1-tap delivery</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Operational Guarantees -->
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
      <div class="card" style="padding: 9px 12px;">
        <div class="card-title" style="font-size: 11.5px;">Zero Order Slippage Guarantee</div>
        <div class="card-p">Every placed order is recorded with server timestamps. Orders cannot disappear, get lost, or suffer from status discrepancies between devices.</div>
      </div>
      <div class="card" style="padding: 9px 12px;">
        <div class="card-title" style="font-size: 11.5px;">Complete Audit Trail &amp; Reconciliation</div>
        <div class="card-p">Every transaction links customer phone, payment ID, timestamp, preparation time, and assigned delivery courier for simple financial auditing.</div>
      </div>
      <div class="card" style="padding: 9px 12px;">
        <div class="card-title" style="font-size: 11.5px;">Scalable High-Availability Architecture</div>
        <div class="card-p">Engineered to handle high order spikes during weekend rush hours and tourist seasons without slowdown or server downtime.</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 10 · System Architecture &amp; Data Pipeline</span>
    <span class="page-pill">Page 11 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 12: BUSINESS BENEFITS & ROI (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>COMMERCIAL IMPACT &amp; VALUE</div>
        <h2>Tangible Business Benefits for Alfiya Kitchen</h2>
        <p>Transforming food delivery from a high-commission third-party dependency into an invaluable proprietary revenue generator that grows your bottom line.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- 6 Benefit Cards in 2x3 Grid for A4 Portrait -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">💰</div>
        <div class="card-title">Direct Customer Orders</div>
        <div class="card-p">Every order placed on your platform avoids 20%–30% aggregator cuts. That margin stays 100% inside Alfiya Kitchen's bank account.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">Net Margin Improvement: +25%</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">👑</div>
        <div class="card-title">Complete Brand Authority</div>
        <div class="card-p">Customers see only Alfiya Kitchen's culinary story and signature dishes, rather than browsing competitor menus on delivery portals.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">100% Exclusive Brand Focus</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">📋</div>
        <div class="card-title">Centralized Order Control</div>
        <div class="card-p">No more scrambled phone messages or chaotic paper chits. The kitchen admin dashboard streamlines prep, dispatch, and delivery into a clean queue.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">Faster Kitchen Turnaround</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">💳</div>
        <div class="card-title">Instant Cash Flow</div>
        <div class="card-p">Digital payments settle directly into the restaurant's merchant account, freeing you from aggregator payout holds and delayed reconciliation.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">Direct Merchant Settlement</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">📊</div>
        <div class="card-title">Customer Asset Ownership</div>
        <div class="card-p">Build an authentic database of diner phone numbers and ordering histories for direct WhatsApp promotions, seasonal discounts, and festival greetings.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">High Lifetime Customer Value</div>
      </div>

      <div class="card">
        <div class="icon-pill" style="margin-bottom: 5px;">🌱</div>
        <div class="card-title">Future-Ready Scalability</div>
        <div class="card-p">Built on modern cloud architecture. As Alfiya Kitchen expands to more branches, catering, or express kiosks, your software scales seamlessly.</div>
        <div style="margin-top: 6px; font-size: 9px; font-weight: 700; color: #1E6526;">Long-Term Tech Capital Asset</div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 11 · Commercial Return on Investment</span>
    <span class="page-pill">Page 12 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 13: THREE PACKAGE OPTIONS (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>INVESTMENT TIERS</div>
        <h2>Clear Implementation Packages &amp; Pricing</h2>
        <p>Select the optimal configuration based on Alfiya Kitchen's immediate operational goals and digital growth timeline.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- 3 Pricing Packages Formatted for A4 Portrait -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      <!-- Package 1 -->
      <div class="card" style="padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="tag tag-blue" style="font-size: 8px;">STARTER WEB TIER</span>
            <div style="font-size: 13.5px; font-weight: 800; color: #131E15; margin-top: 2px;">PACKAGE 1 — WEBSITE ONLY</div>
            <div style="font-size: 9.5px; color: #58675A;">For restaurants seeking an online presence and browser-based ordering.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 8.5px; font-weight: 700; color: #738476; text-transform: uppercase;">STARTING FROM</div>
            <div style="font-size: 20px; font-weight: 800; color: #1E6526;">₹40,000</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; border-top: 1px solid #EDF2EC; padding-top: 6px;">
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Responsive Web Ordering Platform</li>
            <li><span class="check-icon">✓</span> Full Digital Menu &amp; Categories</li>
            <li><span class="check-icon">✓</span> Online Cart &amp; Manual Address Checkout</li>
          </ul>
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Basic Kitchen Order Admin Dashboard</li>
            <li><span class="check-icon">✓</span> Mobile, Tablet &amp; Desktop Browser Support</li>
            <li style="color: #9CA3AF;"><span style="color: #9CA3AF; font-size: 10px;">✕</span> Mobile App not included in this tier</li>
          </ul>
        </div>
      </div>

      <!-- Package 2 -->
      <div class="card" style="padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="tag tag-gold" style="font-size: 8px;">EXPANDED MOBILE TIER</span>
            <div style="font-size: 13.5px; font-weight: 800; color: #131E15; margin-top: 2px;">PACKAGE 2 — WEB APP + PLAY STORE</div>
            <div style="font-size: 9.5px; color: #58675A;">For restaurants wanting an Android mobile presence with Play Store release.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 8.5px; font-weight: 700; color: #738476; text-transform: uppercase;">STARTING BELOW</div>
            <div style="font-size: 20px; font-weight: 800; color: #1E6526;">₹60,000</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; border-top: 1px solid #EDF2EC; padding-top: 6px;">
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Responsive Web Ordering Platform</li>
            <li><span class="check-icon">✓</span> Android Google Play Store Deployment</li>
            <li><span class="check-icon">✓</span> Complete Customer Ordering Experience</li>
          </ul>
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Core Restaurant Admin Order Management</li>
            <li><span class="check-icon">✓</span> Dynamic Menu Updates &amp; Price Editing</li>
            <li><span class="check-icon">✓</span> Online Payment Gateway Integration</li>
          </ul>
        </div>
      </div>

      <!-- Package 3 (Featured) -->
      <div class="card card-highlight" style="padding: 11px 14px; position: relative; border-width: 2px;">
        <div style="position: absolute; top: -9px; right: 14px; background: #1E6526; color: #FFFFFF; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 2.5px 8px; border-radius: 10px;">
          RECOMMENDED FOR ALFIYA KITCHEN
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="tag tag-green" style="font-size: 8px;">FLAGSHIP ECOSYSTEM</span>
            <div style="font-size: 14px; font-weight: 800; color: #1E6526; margin-top: 2px;">PACKAGE 3 — COMPLETE PLATFORM</div>
            <div style="font-size: 9.5px; color: #58675A;">The total, end-to-end proprietary restaurant ordering technology suite.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 8.5px; font-weight: 700; color: #738476; text-transform: uppercase;">COMPLETE ENTERPRISE SUITE</div>
            <div style="font-size: 22px; font-weight: 800; color: #1E6526;">₹60,000+</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; border-top: 1px solid #CDE2CF; padding-top: 6px;">
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Dedicated Customer Mobile App (iOS / Android)</li>
            <li><span class="check-icon">✓</span> Public High-Converting Responsive Website</li>
            <li><span class="check-icon">✓</span> Restaurant Admin Command Dashboard</li>
            <li><span class="check-icon">✓</span> Dedicated Delivery Person Dispatch Portal</li>
          </ul>
          <ul class="check-list" style="margin: 0;">
            <li><span class="check-icon">✓</span> Account-Scoped Isolated Cart Architecture</li>
            <li><span class="check-icon">✓</span> Full Online Payment Gateway Integration</li>
            <li><span class="check-icon">✓</span> 5-Stage Live Order Tracking Progression</li>
            <li><span class="check-icon">✓</span> Production Cloud Setup &amp; Full Handover</li>
          </ul>
        </div>
        <div style="font-size: 8.5px; color: #1E6526; font-weight: 600; margin-top: 6px; border-top: 1px dashed #D5E5D5; padding-top: 4px;">
          Final investment calibrated to exact scope, gateway requirements &amp; deployment options.
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 12 · Package Comparison &amp; Investment Tiers</span>
    <span class="page-pill">Page 13 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 14: PAYMENT MILESTONES & OPERATING COSTS (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>TRANSPARENT TERMS</div>
        <h2>Commercial Milestones &amp; Operating Cost Clarity</h2>
        <p>A transparent commercial structure tied directly to tangible project deliverables, with complete disclosure of external third-party operational fees.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Structured 3-Stage Payment Milestones -->
    <div class="card" style="margin: 6px 0;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        STRUCTURED 3-STAGE PAYMENT MILESTONES
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="background: #F8FAF7; border: 1px solid #DCE5D9; border-radius: 7px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; font-weight: 800; color: #152217;">STAGE 1 · ADVANCE COMMENCEMENT</div>
            <span class="tag tag-green" style="font-size: 10px;">30%</span>
          </div>
          <div style="font-size: 9px; color: #556457; margin-top: 3px; line-height: 1.35;">
            Project kickoff, architecture finalization, database setup, and UI/UX design confirmation. Development officially begins upon receipt of advance.
          </div>
        </div>

        <div style="background: #F8FAF7; border: 1px solid #DCE5D9; border-radius: 7px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; font-weight: 800; color: #152217;">STAGE 2 · CORE MILESTONE DELIVERY</div>
            <span class="tag tag-blue" style="font-size: 10px;">40%</span>
          </div>
          <div style="font-size: 9px; color: #556457; margin-top: 3px; line-height: 1.35;">
            Customer mobile app / website, dynamic menu management, and restaurant admin dashboard completed and presented in a live staging environment for review.
          </div>
        </div>

        <div style="background: #F8FAF7; border: 1px solid #DCE5D9; border-radius: 7px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; font-weight: 800; color: #152217;">STAGE 3 · FINAL HANDOVER &amp; LAUNCH</div>
            <span class="tag tag-gold" style="font-size: 10px;">30%</span>
          </div>
          <div style="font-size: 9px; color: #556457; margin-top: 3px; line-height: 1.35;">
            End-to-end order &amp; payment testing, production domain setup, delivery portal verification, staff walkthrough, credentials handover, and live launch.
          </div>
        </div>
      </div>
    </div>

    <!-- Operating Costs Transparency -->
    <div class="card" style="margin-top: 6px;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
        TRANSPARENT THIRD-PARTY OPERATING EXPENSES
      </div>
      <div style="font-size: 9px; color: #556358; margin-bottom: 6px;">
        External services required to keep digital applications live are billed at direct cost by providers:
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">Domain Name (.com / .in)</span>
          <span style="color: #556358;">~₹800 – ₹1,200 / year (GoDaddy / Namecheap)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">Cloud Database &amp; Server Hosting</span>
          <span style="color: #556358;">Free tier available / ₹800–₹2,000/mo at scale</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">Payment Gateway Fees</span>
          <span style="color: #556358;">Standard ~1.8%–2% per tx (Direct PG fee)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">Google Play Developer Account</span>
          <span style="color: #556358;">$25 one-time fee (Paid directly to Google)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">Apple Developer Account (if iOS)</span>
          <span style="color: #556358;">$99 / year (Paid directly to Apple)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #FBFBFA; border: 1px solid #EAEFE7; border-radius: 5px;">
          <span style="font-weight: 700; color: #1A241C;">SMS / WhatsApp Alerts</span>
          <span style="color: #556358;">Optional · Per transactional consumption</span>
        </div>
      </div>

      <div style="background: #F1F7F1; border: 1px solid #C4DFC7; border-radius: 6px; padding: 5px 8px; font-size: 8.5px; color: #166534; font-weight: 600; margin-top: 6px;">
        ✓ No Hidden Fees: Software development fees cover 100% of the platform engineering, setup, and deployment.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 13 · Commercial Milestones &amp; External Expenses</span>
    <span class="page-pill">Page 14 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 15: SECURITY & FUTURE ROADMAP (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>SECURITY &amp; FUTURE SCALABILITY</div>
        <h2>Enterprise Reliability &amp; Optional Future Roadmap</h2>
        <p>Built upon proven security standards to safeguard diner trust today, with a clear evolutionary roadmap ready whenever Alfiya Kitchen is ready to expand.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- Security Standards -->
    <div class="card" style="margin: 6px 0;">
      <div style="font-size: 10.5px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        SECURITY &amp; SYSTEM RELIABILITY STANDARDS
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span class="icon-pill" style="font-size: 9px; width: 20px; height: 20px;">🔒</span>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Role-Based Access</div>
            <div style="font-size: 8.5px; color: #556457;">Strict separation between Customer, Admin, and Delivery roles.</div>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span class="icon-pill" style="font-size: 9px; width: 20px; height: 20px;">🛡️</span>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Encrypted Auth &amp; Sessions</div>
            <div style="font-size: 8.5px; color: #556457;">Protected by industry-standard hashed credential storage.</div>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span class="icon-pill" style="font-size: 9px; width: 20px; height: 20px;">⚡</span>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Server Transaction Validation</div>
            <div style="font-size: 8.5px; color: #556457;">Pricing &amp; payment verification occur on the server.</div>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 6px;">
          <span class="icon-pill" style="font-size: 9px; width: 20px; height: 20px;">☁️</span>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #142016;">Cloud Database Backups</div>
            <div style="font-size: 8.5px; color: #556457;">Continuous snapshots safeguard historical transaction logs.</div>
          </div>
        </div>
      </div>
      <div style="font-size: 8px; color: #6F8172; border-top: 1px solid #EDF2EC; padding-top: 4px; margin-top: 5px;">
        Note: Grounded in pragmatic engineering best practices — no exaggerated "100% hack-proof" claims.
      </div>
    </div>

    <!-- Future Expansion Modules -->
    <div class="card" style="margin-top: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <div style="font-size: 10.5px; font-weight: 800; color: #C28E2E; text-transform: uppercase; letter-spacing: 0.8px;">
          FUTURE EXPANSION MODULES
        </div>
        <span class="tag tag-gold" style="font-size: 7.5px;">OPTIONAL ROADMAP</span>
      </div>
      <div style="font-size: 9px; color: #58675A; margin-bottom: 6px;">
        These advanced capabilities can be seamlessly integrated in Phase 2 as order volume scales:
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 9px;">
        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">⭐ Loyalty &amp; Rewards Points</div>
          <div style="font-size: 8px; color: #6D635B;">Points on every order redeemable for free dishes.</div>
        </div>

        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">🎟️ Dynamic Promo Coupons</div>
          <div style="font-size: 8px; color: #6D635B;">Targeted codes (e.g., FESTIVAL20, WEEKEND10).</div>
        </div>

        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">💬 WhatsApp Order Updates</div>
          <div style="font-size: 8px; color: #6D635B;">Direct automated dispatch alerts on WhatsApp.</div>
        </div>

        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">🖨️ Thermal POS Integration</div>
          <div style="font-size: 8px; color: #6D635B;">Instant kitchen docket printing on receipt printers.</div>
        </div>

        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">🏢 Multi-Branch Architecture</div>
          <div style="font-size: 8px; color: #6D635B;">Expand across multiple outlets from one dashboard.</div>
        </div>

        <div style="background: #FFFDF9; border: 1px solid #EEDFCA; border-radius: 5px; padding: 5px 8px;">
          <div style="font-weight: 700; color: #221D16;">📊 Advanced Diner Analytics</div>
          <div style="font-size: 8px; color: #6D635B;">Peak ordering hours and top dish profit margins.</div>
        </div>
      </div>

      <div style="font-size: 8px; color: #92400E; background: #FEF3C7; padding: 4px 7px; border-radius: 4px; font-weight: 600; margin-top: 6px;">
        Clearly marked as optional future scope — available on demand without altering core stability.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 14 · System Reliability &amp; Scalability Roadmap</span>
    <span class="page-pill">Page 15 of 16</span>
  </div>
</div>

<!-- ==========================================
     PAGE 16: PROJECT DELIVERY & CALL TO ACTION (A4 Portrait)
     ========================================== -->
<div class="slide">
  <div>
    <div class="slide-header">
      <div class="slide-title-group">
        <div class="eyebrow"><span class="eyebrow-pill"></span>EXECUTION &amp; NEXT STEPS</div>
        <h2>Structured Project Delivery &amp; Partnership</h2>
        <p>A proven, 7-phase implementation methodology ensuring that Alfiya Kitchen launches smoothly, on schedule, and with zero operational disruption.</p>
      </div>
      <div class="brand-badge"><div class="logo-circle">A</div><span>ALFIYA KITCHEN</span></div>
    </div>

    <!-- 7 Delivery Phases Process Grid for Portrait -->
    <div class="card" style="margin: 6px 0; padding: 10px 12px;">
      <div style="font-size: 10px; font-weight: 800; color: #1E6526; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        7-PHASE METHODOLOGY FOR ON-TIME LAUNCH
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; text-align: center; margin-bottom: 5px;">
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">01 DISCOVERY</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">Menu &amp; flow audit</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">02 UI/UX</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">App &amp; web designs</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">03 BUILD</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">Core ecosystem code</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">04 INTEGRATE</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">Payment gateway</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; text-align: center;">
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">05 QA TEST</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">Carts &amp; real test orders</div>
        </div>
        <div style="background: #F7FAF7; border: 1px solid #DDE7DC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #1E6526;">06 DEPLOY</div>
          <div style="font-size: 7.5px; color: #556457; margin-top: 1px;">Cloud &amp; stores live</div>
        </div>
        <div style="background: #EDF7EE; border: 1px solid #B8E0BC; border-radius: 5px; padding: 5px 3px;">
          <div style="font-size: 8.5px; font-weight: 800; color: #166534;">07 HANDOVER</div>
          <div style="font-size: 7.5px; color: #166534; margin-top: 1px;">Staff training &amp; keys</div>
        </div>
      </div>
    </div>

    <!-- Final Call to Action Box -->
    <div style="background: linear-gradient(135deg, #184D1F 0%, #113416 100%); border-radius: 12px; padding: 16px 18px; color: #FFFFFF; margin-top: 10px;">
      <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: #86EFAC; font-weight: 800;">READY TO TAKE YOUR RESTAURANT ORDERS DIGITAL?</span>
      <h3 style="font-size: 18px; font-weight: 800; line-height: 1.25; margin: 5px 0 8px 0;">
        Let's Build a Direct, Modern &amp; Scalable Ordering Experience for Alfiya Kitchen.
      </h3>
      <p style="font-size: 10.5px; color: #C6DEC9; line-height: 1.4; margin-bottom: 12px;">
        Eliminate third-party commissions, gain permanent ownership of your customer data, and deliver a frictionless ordering experience directly to your diners' doorsteps.
      </p>

      <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 12px 14px;">
        <div style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #86EFAC; font-weight: 700;">PREPARED &amp; PRESENTED BY</div>
        <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">Mohammed Nibrasul Haqq  <br> Ahemed Rafeek </div>
        <div style="font-size: 9.5px; color: #D1E7D4; margin-top: 1px;">Freelance Full-Stack Developers &amp; UI/UX Designers</div>
        
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; gap: 4px; font-size: 9.5px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>✉️</span>
            <a href="mailto:nibrasulhaqqamini@gmail.com" style="color: #FFFFFF; font-weight: 600; text-decoration: none;">nibrasulhaqqamini@gmail.com</a>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>🌐</span>
            <a href="https://alfiya-kitchen.vercel.app/" style="color: #86EFAC; font-weight: 600; text-decoration: none;">alfiya-kitchen.vercel.app</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span class="left">Alfiya Kitchen · Digital Food Ordering Platform</span>
    <span class="center">Section 15 · Delivery Process &amp; Partnership Proposal</span>
    <span class="page-pill">Page 16 of 16</span>
  </div>
</div>

</body>
</html>
"""

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Saved A4 Portrait HTML to {HTML_FILE}")

# Execute Chrome Headless to generate PDF in A4 Portrait
print("Generating A4 Portrait PDF via Google Chrome...")
chrome_cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_FILE}",
    HTML_FILE
]
subprocess.run(chrome_cmd, check=True)
print(f"PDF generated successfully at {PDF_FILE}")

# Convert PDF pages to 2x retina PNG preview images
print("Rendering preview images of each A4 portrait page...")
url = NSURL.fileURLWithPath_(PDF_FILE)
doc = Quartz.PDFDocument.alloc().initWithURL_(url)
page_count = doc.pageCount()
print(f"Total pages in PDF: {page_count}")

for i in range(page_count):
    page = doc.pageAtIndex_(i)
    rect = page.boundsForBox_(Quartz.kPDFDisplayBoxMediaBox)
    scale = 2.0  # 2x scale for crisp inspection
    width = int(rect.size.width * scale)
    height = int(rect.size.height * scale)
    
    cs = Quartz.CGColorSpaceCreateDeviceRGB()
    ctx = Quartz.CGBitmapContextCreate(None, width, height, 8, width * 4, cs, Quartz.kCGImageAlphaPremultipliedLast)
    Quartz.CGContextScaleCTM(ctx, scale, scale)
    Quartz.CGContextSetFillColorWithColor(ctx, Quartz.CGColorCreate(cs, (0.98, 0.98, 0.97, 1.0)))
    Quartz.CGContextFillRect(ctx, rect)
    page.drawWithBox_toContext_(Quartz.kPDFDisplayBoxMediaBox, ctx)
    image = Quartz.CGBitmapContextCreateImage(ctx)
    
    dest_path = os.path.join(PREVIEW_DIR, f"page_{i+1:02d}.png")
    dest_url = NSURL.fileURLWithPath_(dest_path)
    dest = Quartz.CGImageDestinationCreateWithURL(dest_url, "public.png", 1, None)
    Quartz.CGImageDestinationAddImage(dest, image, None)
    Quartz.CGImageDestinationFinalize(dest)

print("All A4 portrait preview images generated successfully!")
