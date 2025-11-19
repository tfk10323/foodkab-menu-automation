# Quick Start Checklist

## Setup (5 Minutes)

- [ ] **Step 1:** Create private GitHub repo called `foodkab-menu-automation`
  
- [ ] **Step 2:** Upload all files from this folder to the repo
  
- [ ] **Step 3:** Add GitHub Secrets (Settings → Secrets → Actions → New)
  - [ ] `HYPERZOD_API_KEY` = [Get from Hyperzod Admin]
  - [ ] `HYPERZOD_TENANT_ID` = `4979`
  - [ ] `HYPERZOD_MERCHANT_ID` = `67b8db4d10bbed7deb091335`

- [ ] **Step 4:** Enable GitHub Actions
  - [ ] Go to Actions tab
  - [ ] Click "I understand my workflows, go ahead and enable them"

## Testing (Before Going Live)

- [ ] Test "Evening Flip" workflow manually
  - [ ] Go to Actions → Evening Flip → Run workflow
  - [ ] Check menu - lunch/dinner should be OFF, breakfast ON
  
- [ ] Test "Morning Lunch Start" workflow manually
  - [ ] Go to Actions → Morning Lunch Start → Run workflow  
  - [ ] Check menu - lunch/dinner and today's special should be ON
  
- [ ] Test "Breakfast End" workflow manually
  - [ ] Go to Actions → Breakfast End → Run workflow
  - [ ] Check menu - breakfast should be OFF

## Verify Schedule

- [ ] Check that workflows run automatically:
  - [ ] 10:00 PM - Evening Flip
  - [ ] 10:30 AM - Morning Lunch Start
  - [ ] 11:00 AM - Breakfast End

## Done! 🎉

Your menu now updates automatically. No more alarms, no more manual toggling.

Monitor execution in the Actions tab. Get notifications by clicking Watch → Custom → Actions.

---

## For Your Next Restaurant

1. Duplicate `hyperzod-menu-automation.js`
2. Update merchant ID and category IDs
3. Create new workflow files pointing to new script
4. Add new merchant ID as GitHub Secret
5. Done!
