# Hyperzod Menu Automation

**Automated menu category management for Food KAB restaurants.**

This system automatically shows/hides menu categories based on time of day, eliminating the need for manual category toggling and alarm management.

## 🎯 What It Does

### Daily Schedule (All Times Central)

**10:00 PM Every Night:**
- ❌ Turn OFF all lunch/dinner categories
- ❌ Turn OFF all daily specials
- ✅ Turn ON breakfast categories

**10:30 AM Every Morning:**
- ✅ Turn ON all lunch/dinner categories  
- ✅ Turn ON today's daily special (Tue-Sat only)

**11:00 AM Every Morning:**
- ❌ Turn OFF breakfast categories

**Always Visible:**
- Tip category (never touched)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name it: `foodkab-menu-automation` (or whatever you want)
3. Make it **Private** (keeps your config secure)
4. Click **Create repository**

### Step 2: Upload Files

**Option A: Via GitHub Web Interface**
1. Click "uploading an existing file"
2. Drag and drop ALL these files:
   - `hyperzod-menu-automation.js`
   - `package.json`
   - `.github/workflows/evening-flip.yml`
   - `.github/workflows/morning-lunch.yml`
   - `.github/workflows/breakfast-end.yml`

**Option B: Via Git Command Line**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/foodkab-menu-automation.git
git push -u origin main
```

### Step 3: Add API Credentials

1. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these three secrets:

| Name | Value | Where to Find |
|------|-------|---------------|
| `HYPERZOD_API_KEY` | Your rotated API key | Hyperzod Admin → Settings → API |
| `HYPERZOD_TENANT_ID` | `4979` | Your tenant ID |
| `HYPERZOD_MERCHANT_ID` | `67b8db4d10bbed7deb091335` | 3-W's Smoke Shack merchant ID |

### Step 4: Enable Actions

1. Go to the **Actions** tab in your repo
2. Click "I understand my workflows, go ahead and enable them"
3. Done! 🎉

---

## ✅ Testing (Before Going Live)

Test each workflow manually before waiting for scheduled times:

1. Go to **Actions** tab
2. Click on a workflow (e.g., "Evening Flip")
3. Click **Run workflow** → **Run workflow**
4. Watch it execute in real-time
5. Check your menu on foodkab.com to verify categories changed

**Test all three workflows:**
- Evening Flip (10 PM)
- Morning Lunch Start (10:30 AM)
- Breakfast End (11:00 AM)

---

## 📊 Monitoring

### View Execution History
- Go to **Actions** tab
- See all past runs with timestamps
- Click any run to see detailed logs

### Get Notifications
1. Go to **Watch** (top right) → **Custom** → **Actions**
2. Get email notifications for failures

---

## 🔧 Customization

### For Other Restaurants

Create a copy of `hyperzod-menu-automation.js` for each restaurant:

```javascript
// Change these values at the top of the file:
const HYPERZOD_CONFIG = {
  merchantId: 'YOUR_OTHER_RESTAURANT_ID'
};

const CATEGORIES = {
  // Update category IDs for this restaurant
  breakfast: [
    { id: "CATEGORY_ID_HERE", name: "Breakfast", ... }
  ],
  // ... etc
};
```

Then create separate workflow files pointing to the new script.

### Adjust Timing

Edit the `cron` schedule in workflow files:

```yaml
schedule:
  # Format: minute hour day month day-of-week
  # Times are in UTC (Central Time + 6 hours)
  - cron: '0 4 * * *'  # 10:00 PM Central = 4:00 AM UTC next day
```

**Common Times:**
- 6:00 AM Central = `0 12 * * *`
- 9:00 AM Central = `0 15 * * *`
- 2:00 PM Central = `0 20 * * *`
- 6:00 PM Central = `0 0 * * *` (next day in UTC)

---

## 🛠️ Local Testing

Test the script on your computer before deploying:

### Setup
```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org/

# Set environment variables (Windows)
set HYPERZOD_API_KEY=your_key_here
set HYPERZOD_TENANT_ID=4979
set HYPERZOD_MERCHANT_ID=67b8db4d10bbed7deb091335

# Set environment variables (Mac/Linux)
export HYPERZOD_API_KEY=your_key_here
export HYPERZOD_TENANT_ID=4979
export HYPERZOD_MERCHANT_ID=67b8db4d10bbed7deb091335
```

### Run Tests
```bash
# Test evening flip
node hyperzod-menu-automation.js evening-flip

# Test morning lunch
node hyperzod-menu-automation.js morning-lunch

# Test breakfast end
node hyperzod-menu-automation.js breakfast-end
```

---

## 📋 Restaurant Configuration

### 3-W's Smoke Shack

**Merchant ID:** `67b8db4d10bbed7deb091335`

**20 Total Categories:**

| Category | Always Visible | Schedule |
|----------|---------------|----------|
| (OPTIONAL) Tip Your To-Go Team! | ✅ | 24/7 |
| Breakfast | ❌ | 10 PM - 11 AM |
| Kids Menu | ❌ | 10 PM - 11 AM |
| Tuesday Specials | ❌ | Tue 10:30 AM - 10 PM |
| Wednesday Specials | ❌ | Wed 10:30 AM - 10 PM |
| Thursday Specials | ❌ | Thu 10:30 AM - 10 PM |
| Friday Specials | ❌ | Fri 10:30 AM - 10 PM |
| Saturday Specials | ❌ | Sat 10:30 AM - 10 PM |
| Family Packs | ❌ | 10:30 AM - 10 PM daily |
| Chicken Tenders | ❌ | 10:30 AM - 10 PM daily |
| Meat Options | ❌ | 10:30 AM - 10 PM daily |
| Meat Plates | ❌ | 10:30 AM - 10 PM daily |
| Wings | ❌ | 10:30 AM - 10 PM daily |
| Smaller Plates | ❌ | 10:30 AM - 10 PM daily |
| Sandwiches | ❌ | 10:30 AM - 10 PM daily |
| Burgers | ❌ | 10:30 AM - 10 PM daily |
| Sides | ❌ | 10:30 AM - 10 PM daily |
| More Items | ❌ | 10:30 AM - 10 PM daily |
| Drinks | ❌ | 10:30 AM - 10 PM daily |
| Desserts | ❌ | 10:30 AM - 10 PM daily |

---

## 🐛 Troubleshooting

### Workflows Not Running
- Check GitHub Actions are enabled (Settings → Actions → Allow all actions)
- Verify secrets are set correctly (case-sensitive!)
- Check workflow files are in `.github/workflows/` directory

### Categories Not Updating
- Check workflow execution logs in Actions tab
- Verify merchant ID is correct
- Verify category IDs haven't changed
- Test API credentials manually in browser console

### Wrong Timing
- Remember: GitHub Actions uses UTC time
- Central Time = UTC - 6 hours (or -5 during DST)
- Use a UTC converter: https://www.worldtimebuddy.com/

### API Key Issues
- Regenerate API key in Hyperzod admin panel
- Update the secret in GitHub repo settings
- API keys are case-sensitive

---

## 💰 Cost

**$0.00/month**

- GitHub Actions: Free for public repos, 2,000 minutes/month for private repos
- This automation uses ~3 minutes/day = 90 minutes/month
- Well within free tier limits

---

## 🎓 How It Works

1. **GitHub Actions** runs on a schedule (like cron jobs)
2. **Workflows** trigger at specific times
3. **Node.js script** calls Hyperzod API to update category status
4. **Categories** automatically show/hide on your menu
5. **Zero manual intervention** required

---

## 📝 License

MIT License - Use this for any Food KAB restaurant

---

## 🆘 Support

Questions? Issues? Contact the Food KAB tech team or file an issue in this repo.

---

**Built for Food KAB by Kevin with ❤️ and Claude**
