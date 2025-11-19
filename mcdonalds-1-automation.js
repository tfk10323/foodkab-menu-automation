/**
 * Hyperzod Menu Category Automation - McDonald's Location 1
 * Breakfast categories with different weekday/weekend hours
 * 
 * Schedule:
 * - Mon-Fri: 10 PM prev night - 10:30 AM
 * - Sat-Sun: 10 PM prev night - 11 AM
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.MCDONALDS_1_MERCHANT_ID
};

// Category configuration for McDonald's Location 1
const CATEGORIES = {
  // Breakfast categories
  breakfast: [
    {
      id: "6873d40284edce627e011b98",
      name: "Home Style Breakfasts",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "6873d40184edce627e011b82",
      name: "Sandwiches & Meals - Breakfast",
      view_type: "list",
      sort_order: 1
    },
    {
      id: "6873d60184edce627e011b9d",
      name: "Sides & More",
      view_type: "list",
      sort_order: 2
    },
    {
      id: "6878cc6a86500e73f40192f2",
      name: "Breakfast Condiments",
      view_type: "list",
      sort_order: 2
    }
  ]
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
 * Run weekday evening (Sun-Thu 10 PM)
 * Turn ON breakfast for next day
 */
async function runWeekdayEvening() {
  const today = getCurrentDay();
  
  console.log('=== WEEKDAY EVENING (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  await updateCategories(CATEGORIES.breakfast, true, 'Turning ON breakfast for tomorrow');
  
  console.log('\n✓ Breakfast prep complete!');
}

/**
 * Run weekday morning (Mon-Fri 10:30 AM)
 * Turn OFF breakfast
 */
async function runWeekdayMorning() {
  const today = getCurrentDay();
  
  console.log('=== WEEKDAY MORNING (10:30 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  await updateCategories(CATEGORIES.breakfast, false, 'Turning OFF breakfast');
  
  console.log('\n✓ Breakfast closed!');
}

/**
 * Run weekend evening (Fri-Sat 10 PM)
 * Turn ON breakfast for weekend
 */
async function runWeekendEvening() {
  const today = getCurrentDay();
  
  console.log('=== WEEKEND EVENING (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  await updateCategories(CATEGORIES.breakfast, true, 'Turning ON breakfast for weekend');
  
  console.log('\n✓ Weekend breakfast prep complete!');
}

/**
 * Run weekend morning (Sat-Sun 11 AM)
 * Turn OFF breakfast
 */
async function runWeekendMorning() {
  const today = getCurrentDay();
  
  console.log('=== WEEKEND MORNING (11:00 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  await updateCategories(CATEGORIES.breakfast, false, 'Turning OFF breakfast');
  
  console.log('\n✓ Weekend breakfast closed!');
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
    console.error('  - MCDONALDS_1_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'weekday-evening':
      await runWeekdayEvening();
      break;
    case 'weekday-morning':
      await runWeekdayMorning();
      break;
    case 'weekend-evening':
      await runWeekendEvening();
      break;
    case 'weekend-morning':
      await runWeekendMorning();
      break;
    default:
      console.error('ERROR: Invalid action. Use one of:');
      console.error('  - weekday-evening');
      console.error('  - weekday-morning');
      console.error('  - weekend-evening');
      console.error('  - weekend-morning');
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

module.exports = { runWeekdayEvening, runWeekdayMorning, runWeekendEvening, runWeekendMorning };
