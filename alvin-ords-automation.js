/**
 * Hyperzod Menu Category Automation - Alvin Ord's
 * Automatically rotates daily specials each night at 10 PM
 * 
 * Schedule:
 * - 10:00 PM: Turn off today's special, turn on tomorrow's special
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.ALVIN_ORDS_MERCHANT_ID
};

// Category IDs for Alvin Ord's
const CATEGORIES = {
  // Always visible - never touched
  alwaysOn: [
    {
      id: "677d81e67af91cf9f8082bd9",
      name: "(OPTIONAL) Tip Your Restaurant Staff!",
      view_type: "list",
      sort_order: 1
    },
    {
      id: "677d820e7af91cf9f8082bda",
      name: "Slammin' Sandwiches",
      view_type: "list",
      sort_order: 4
    },
    {
      id: "677d82157af91cf9f8082bdb",
      name: "Spice It Up",
      view_type: "list",
      sort_order: 5
    },
    {
      id: "677d821cb04fb71bcb06b4a7",
      name: "Kids Meal",
      view_type: "list",
      sort_order: 6
    },
    {
      id: "677d822cb04fb71bcb06b4a8",
      name: "Pizza",
      view_type: "list",
      sort_order: 8
    },
    {
      id: "677d82347af91cf9f8082bdd",
      name: "Drinks & Chips",
      view_type: "list",
      sort_order: 9
    },
    {
      id: "6877e78a83fca395510c07e5",
      name: "Alvin Ord's Dirty Little Secret Shop!",
      view_type: "list",
      sort_order: 9
    }
  ],
  
  // Daily specials (rotate at 10 PM)
  dailySpecials: {
    monday: {
      id: "68ff68e710b4c4616001a865",
      name: "Monday Specials",
      view_type: "list",
      sort_order: 2
    },
    tuesday: {
      id: "68ff68ee10b4c4616001a866",
      name: "Tuesday Specials",
      view_type: "list",
      sort_order: 2
    },
    wednesday: {
      id: "68ff690010b4c4616001a867",
      name: "Wednesday Specials",
      view_type: "list",
      sort_order: 2
    },
    thursday: {
      id: "68ff690710b4c4616001a868",
      name: "Thursday Specials",
      view_type: "list",
      sort_order: 2
    },
    friday: {
      id: "68ff690e10b4c4616001a869",
      name: "Friday Specials",
      view_type: "list",
      sort_order: 2
    },
    saturday: {
      id: "68ff691a10b4c4616001a86a",
      name: "Saturday Specials",
      view_type: "list",
      sort_order: 2
    }
  }
};

/**
 * Update a single category's visibility status
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
 * Get current day of week (lowercase)
 */
function getCurrentDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

/**
 * Get tomorrow's day of week (lowercase)
 */
function getTomorrowDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return days[tomorrow.getDay()];
}

/**
 * Run the evening specials rotation (10 PM)
 * Turn OFF: today's special
 * Turn ON: tomorrow's special
 */
async function runEveningRotation() {
  console.log('=== EVENING SPECIALS ROTATION (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  
  const today = getCurrentDay();
  const tomorrow = getTomorrowDay();
  
  // Turn OFF today's special (if it exists - not Sunday)
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], false, `Turning OFF ${today}'s special`);
  } else {
    console.log(`\nNo special for ${today} (Sunday)`);
  }
  
  // Turn ON tomorrow's special (if it exists - not Sunday)
  const tomorrowSpecial = CATEGORIES.dailySpecials[tomorrow];
  if (tomorrowSpecial) {
    await updateCategories([tomorrowSpecial], true, `Turning ON ${tomorrow}'s special`);
  } else {
    console.log(`\nNo special for ${tomorrow} (Sunday)`);
  }
  
  console.log('\n✓ Evening rotation complete!');
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
    console.error('  - ALVIN_ORDS_MERCHANT_ID');
    process.exit(1);
  }
  
  await runEveningRotation();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runEveningRotation };
