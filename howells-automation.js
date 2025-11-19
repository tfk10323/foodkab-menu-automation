/**
 * Hyperzod Menu Category Automation - Howell's
 * Daily specials rotation + Tonight's Special (Wed-Fri)
 * 
 * Schedule:
 * - 10:30 AM daily: Turn ON today's daily special
 * - 3:00 PM daily: Turn OFF today's daily special
 * - 4:00 PM Wed-Fri: Turn ON Tonight's Special
 * - 8:00 PM Wed-Fri: Turn OFF Tonight's Special
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.HOWELLS_MERCHANT_ID
};

// Category configuration for Howell's
const CATEGORIES = {
  // Daily specials (10:30 AM - 3:00 PM on respective days)
  dailySpecials: {
    monday: {
      id: "69115ced821a78fa85031805",
      name: "Monday Specials",
      view_type: "list",
      sort_order: 0
    },
    tuesday: {
      id: "691c928031c7958fb404ebc4",
      name: "Tuesday Specials",
      view_type: "list",
      sort_order: 0
    },
    wednesday: {
      id: "690b89c9ad1793355006deb3",
      name: "Wednesday Specials",
      view_type: "list",
      sort_order: 0
    },
    thursday: {
      id: "690cbb9b8a84e0abf1072362",
      name: "Thursday Specials",
      view_type: "list",
      sort_order: 0
    },
    friday: {
      id: "690e226ca3fd1eb5d40c8820",
      name: "Friday Specials",
      view_type: "list",
      sort_order: 0
    },
    saturday: {
      id: "691e2e0349377c39380d23e2",
      name: "Saturday Specials",
      view_type: "list",
      sort_order: 0
    },
    sunday: {
      id: "690f443c066c09160b0e7c2a",
      name: "Sunday Specials",
      view_type: "list",
      sort_order: 0
    }
  },
  
  // Tonight's Special (Wed-Fri 4:00 PM - 8:00 PM)
  tonightsSpecial: {
    id: "67e453f8645396bf760b9b34",
    name: "Tonights Special! (4pm-8pm)",
    view_type: "list",
    sort_order: 0
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
 * Run morning special (10:30 AM daily)
 * Turn ON today's daily special
 */
async function runMorningSpecial() {
  const today = getCurrentDay();
  
  console.log('=== MORNING SPECIAL (10:30 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Turn ON today's special
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], true, `Turning ON ${today}'s special`);
  }
  
  console.log('\n✓ Morning special activated!');
}

/**
 * Run afternoon close (3:00 PM daily)
 * Turn OFF today's daily special
 */
async function runAfternoonClose() {
  const today = getCurrentDay();
  
  console.log('=== AFTERNOON CLOSE (3:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Turn OFF today's special
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], false, `Turning OFF ${today}'s special`);
  }
  
  console.log('\n✓ Daily special closed!');
}

/**
 * Run evening special (4:00 PM Wed-Fri)
 * Turn ON Tonight's Special
 */
async function runEveningSpecial() {
  const today = getCurrentDay();
  
  console.log('=== EVENING SPECIAL (4:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Only run Wed-Fri
  if (['wednesday', 'thursday', 'friday'].includes(today)) {
    await updateCategories([CATEGORIES.tonightsSpecial], true, "Turning ON Tonight's Special");
    console.log('\n✓ Evening special activated!');
  } else {
    console.log(`\n⚠ Tonight's Special only runs Wed-Fri (today is ${today})`);
  }
}

/**
 * Run night close (8:00 PM Wed-Fri)
 * Turn OFF Tonight's Special
 */
async function runNightClose() {
  const today = getCurrentDay();
  
  console.log('=== NIGHT CLOSE (8:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Only run Wed-Fri
  if (['wednesday', 'thursday', 'friday'].includes(today)) {
    await updateCategories([CATEGORIES.tonightsSpecial], false, "Turning OFF Tonight's Special");
    console.log('\n✓ Evening special closed!');
  } else {
    console.log(`\n⚠ Tonight's Special only runs Wed-Fri (today is ${today})`);
  }
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
    console.error('  - HOWELLS_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'morning-special':
      await runMorningSpecial();
      break;
    case 'afternoon-close':
      await runAfternoonClose();
      break;
    case 'evening-special':
      await runEveningSpecial();
      break;
    case 'night-close':
      await runNightClose();
      break;
    default:
      console.error('ERROR: Invalid action. Use one of:');
      console.error('  - morning-special');
      console.error('  - afternoon-close');
      console.error('  - evening-special');
      console.error('  - night-close');
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

module.exports = { runMorningSpecial, runAfternoonClose, runEveningSpecial, runNightClose };
