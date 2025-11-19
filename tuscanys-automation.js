/**
 * Hyperzod Menu Category Automation - Tuscany's
 * Lunch specials (Mon-Fri) + Weekday special (Mon-Thu)
 * 
 * Schedule:
 * - 10 PM Sun-Thu: Prep tomorrow's Lunch Special + Handle Weekday Special
 * - 3 PM Mon-Fri: Close Lunch Specials
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.TUSCANYS_MERCHANT_ID
};

// Category configuration for Tuscany's
const CATEGORIES = {
  // Lunch Specials (Mon-Fri 10 PM previous night - 3 PM)
  lunchSpecials: {
    id: "677efa0b7af91cf9f8082ce9",
    name: "Lunch Specials",
    view_type: "list",
    sort_order: 5
  },
  
  // Weekday Special (Mon-Thu, Sun 10 PM - Thu 10 PM)
  weekdaySpecial: {
    id: "6908db265b0ee195c70b615b",
    name: "Weekday Special",
    view_type: "list",
    sort_order: 1
  }
};

/**
 * Update a single category's visibility status
 * Uses the same pattern as 3-W's script
 */
async function updateCategory(category, status) {
  const url = `${HYPERZOD_CONFIG.baseUrl}/merchant/v1/catalog/product-category/update`;
  
  const body = {
    id: category.id,
    merchant_id: HYPERZOD_CONFIG.merchantId,
    status: status,
    view_type: category.view_type,
    sort_order: category.sort_order,
    language_translation: [
      {
        key: "name",
        locale: "en",
        value: category.name
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': HYPERZOD_CONFIG.apiKey,
      'X-TENANT': HYPERZOD_CONFIG.tenantId,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Failed to update ${category.name}: ${data.message}`);
  }
  
  return data;
}

/**
 * Update multiple categories with status
 */
async function updateCategories(categories, status, label) {
  console.log(`\n${label}:`);
  
  for (const category of categories) {
    try {
      await updateCategory(category, status);
      console.log(`  ✓ ${category.name} → ${status ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error(`  ✗ ${category.name} → ERROR: ${error.message}`);
    }
  }
}

/**
 * Get current day of week (lowercase) in Central Time
 */
function getCurrentDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const centralDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return days[centralDate.getDay()];
}

/**
 * Run evening prep (10 PM Sun-Thu)
 * - Prep tomorrow's Lunch Special
 * - Handle Weekday Special on/off logic
 */
async function runEveningPrep() {
  const today = getCurrentDay();
  
  console.log('=== EVENING PREP (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Lunch Specials: Turn ON for tomorrow (Sun-Thu nights prep for Mon-Fri)
  if (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].includes(today)) {
    await updateCategories([CATEGORIES.lunchSpecials], true, 'Turning ON Lunch Specials for tomorrow');
  }
  
  // Weekday Special logic
  if (today === 'sunday') {
    // Sunday 10 PM: Turn ON Weekday Special (ready for Monday)
    await updateCategories([CATEGORIES.weekdaySpecial], true, 'Turning ON Weekday Special (Mon-Thu)');
  } else if (today === 'thursday') {
    // Thursday 10 PM: Turn OFF Weekday Special (ends after Thursday)
    await updateCategories([CATEGORIES.weekdaySpecial], false, 'Turning OFF Weekday Special (ends Thu)');
  }
  
  console.log('\n✓ Evening prep complete!');
}

/**
 * Run afternoon close (3 PM Mon-Fri)
 * Turn OFF Lunch Specials
 */
async function runAfternoonClose() {
  const today = getCurrentDay();
  
  console.log('=== AFTERNOON CLOSE (3:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Turn OFF Lunch Specials (Mon-Fri only)
  if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(today)) {
    await updateCategories([CATEGORIES.lunchSpecials], false, 'Turning OFF Lunch Specials');
  }
  
  console.log('\n✓ Lunch specials closed!');
}

/**
 * Main execution
 */
async function main() {
  // Validate environment variables
  if (!HYPERZOD_CONFIG.apiKey || !HYPERZOD_CONFIG.tenantId || !HYPERZOD_CONFIG.merchantId) {
    console.error('ERROR: Missing required environment variables:');
    console.error('  - HYPERZOD_API_KEY');
    console.error('  - HYPERZOD_TENANT_ID');
    console.error('  - TUSCANYS_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'evening-prep':
      await runEveningPrep();
      break;
    case 'afternoon-close':
      await runAfternoonClose();
      break;
    default:
      console.error('ERROR: Invalid action. Use one of:');
      console.error('  - evening-prep');
      console.error('  - afternoon-close');
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runEveningPrep, runAfternoonClose };
