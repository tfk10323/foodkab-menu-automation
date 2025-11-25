/**
 * Hyperzod Menu Category Automation - Pappy Jack's
 * Daily specials rotation (Closed Monday)
 * 
 * Schedule:
 * - 10 PM every night: Turn OFF today, Turn ON tomorrow
 * - Sunday 10 PM: Turn ON Tuesday (skip Monday - closed)
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.PAPPY_JACKS_MERCHANT_ID
};

// Category configuration for Pappy Jack's
const CATEGORIES = {
  // Daily specials (Closed Monday)
  dailySpecials: {
    tuesday: {
      id: "68f7a3ef4f41c2c86b0fa284",
      name: "Tuesday Special",
      view_type: "list",
      sort_order: 0
    },
    wednesday: {
      id: "68f7a3f64f41c2c86b0fa285",
      name: "Wednesday Special",
      view_type: "list",
      sort_order: 0
    },
    thursday: {
      id: "68f7a3fe4f41c2c86b0fa286",
      name: "Thursday Special",
      view_type: "list",
      sort_order: 0
    },
    friday: {
      id: "68f7a40e2bbdf5961d0a0147",
      name: "Friday Special",
      view_type: "list",
      sort_order: 0
    },
    saturday: {
      id: "68f7a4164f41c2c86b0fa287",
      name: "Saturday Special",
      view_type: "list",
      sort_order: 0
    },
    sunday: {
      id: "691e360b7d0fc5b6aa0e0582",
      name: "Sunday Special",
      view_type: "list",
      sort_order: 0
    }
    // No Monday - restaurant closed
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
 * Get current day of week (lowercase) in Central Time
 */
function getCurrentDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const centralDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return days[centralDate.getDay()];
}

/**
 * Get next open day (skip Monday)
 */
function getNextDay(today) {
  const dayMap = {
    'sunday': 'tuesday',    // Skip Monday (closed)
    'monday': 'tuesday',    // Safety: if somehow called on Monday, go to Tuesday
    'tuesday': 'wednesday',
    'wednesday': 'thursday',
    'thursday': 'friday',
    'friday': 'saturday',
    'saturday': 'sunday'
  };
  return dayMap[today];
}

/**
 * Run evening rotation (10 PM)
 * Turn OFF today's special, Turn ON tomorrow's special
 */
async function runEveningRotation() {
  const today = getCurrentDay();
  const tomorrow = getNextDay(today);
  
  console.log('=== EVENING ROTATION (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today} → Rotating to ${tomorrow}`);
  
  // Turn OFF today's special (if exists)
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], false, `Turning OFF ${today}'s special`);
  } else {
    console.log(`\n⚠ No special for ${today} (restaurant closed or no special)`);
  }
  
  // Turn ON tomorrow's special
  const tomorrowSpecial = CATEGORIES.dailySpecials[tomorrow];
  if (tomorrowSpecial) {
    await updateCategories([tomorrowSpecial], true, `Turning ON ${tomorrow}'s special`);
  } else {
    console.log(`\n⚠ No special for ${tomorrow} (restaurant closed or no special)`);
  }
  
  console.log('\n✓ Special rotation complete!');
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
    console.error('  - PAPPY_JACKS_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'evening-rotation':
      await runEveningRotation();
      break;
    default:
      console.error('ERROR: Invalid action. Use:');
      console.error('  - evening-rotation');
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

module.exports = { runEveningRotation };
