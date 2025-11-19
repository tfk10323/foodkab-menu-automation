# Alvin Ord's Menu Automation

**Simple daily specials rotation for Alvin Ord's restaurant.**

## 🎯 What It Does

### Daily Schedule (All Times Central)

**10:00 PM Every Night:**
- ❌ Turn OFF today's daily special
- ✅ Turn ON tomorrow's daily special

**Examples:**
- Sunday 10 PM → Monday Specials turn ON
- Monday 10 PM → Monday Specials turn OFF, Tuesday Specials turn ON
- Tuesday 10 PM → Tuesday Specials turn OFF, Wednesday Specials turn ON
- etc.

**Always Visible (Never Touched):**
- Tip category
- Slammin' Sandwiches
- Spice It Up
- Kids Meal
- Pizza
- Drinks & Chips
- Alvin Ord's Dirty Little Secret Shop!

---

## 🚀 Setup Instructions

### Add to Your Existing Repo

**Step 1: Upload New Files**
1. Go to your `foodkab-menu-automation` repo
2. Click "Add file" → "Upload files"
3. Upload these files:
   - `alvin-ords-automation.js` (root directory)
   - `alvin-ords-evening.yml` (into `.github/workflows/` folder)

**Step 2: Add New Secret**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name:** `ALVIN_ORDS_MERCHANT_ID`
   - **Secret:** `67619c4a0a2131c9a3058de6`
4. Click "Add secret"

**Step 3: Test the Workflow**
1. Go to **Actions** tab
2. Click "Alvin Ord's - Evening Rotation (10 PM)"
3. Click "Run workflow" → "Run workflow"
4. Watch it execute
5. Check menu to verify tomorrow's special is now ON

---

## 📋 Restaurant Configuration

**Merchant ID:** `67619c4a0a2131c9a3058de6`

**Daily Specials:**
- Monday Specials
- Tuesday Specials
- Wednesday Specials
- Thursday Specials
- Friday Specials
- Saturday Specials

**No Sunday special** (restaurant closed or no special)

---

## 🔧 How It Works

**Simple rotation logic:**
1. Determines what day it is
2. Turns OFF today's special
3. Turns ON tomorrow's special
4. Sunday night → Enables Monday Specials for the week ahead

**Runs once per day at 10 PM** - that's it!

---

## 💰 Cost

Still $0.00/month - this adds only ~1 minute/day to your GitHub Actions usage.

---

**Built for Food KAB - Alvin Ord's Location**
