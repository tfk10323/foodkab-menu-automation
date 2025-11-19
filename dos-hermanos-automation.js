/**
 * Hyperzod Menu Category Automation - Dos Hermanos
 * Complex weekend breakfast service + daily specials rotation
 * 
 * Schedule:
 * - Fri/Sat 10 PM: Prep breakfast, rotate specials
 * - Sat/Sun 10:30 AM: Open lunch/dinner  
 * - Sat/Sun 11 AM: Close breakfast
 * - Sun-Thu 10 PM: Rotate specials only
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.DOS_HERMANOS_MERCHANT_ID
};

// Category configuration for Dos Hermanos
const CATEGORIES = {
  // Always visible - never touched
  alwaysOn: [
    {
      id: "675c3e8bfca2c8aa110ae6b5",
      name: "(Optional) Tip the To-Go Restaurant Staff",
      view_type: "list",
      sort_order: 0
    }
  ],
  
  // Breakfast categories (Sat/Sun 7:30 AM - 11 AM)
  breakfast: [
    {
      id: "675c3c2cfca2c8aa110ae5b5",
      name: "Sides",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c3dfca2c8aa110ae5bd",
      name: "Other Items",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c49fca2c8aa110ae5c4",
      name: "From the Griddle",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c55fca2c8aa110ae5cd",
      name: "Burritos & Tacos",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c64fca2c8aa110ae5d5",
      name: "Omelettes",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c71fca2c8aa110ae5dd",
      name: "Breakfast Specials",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c83fca2c8aa110ae5e5",
      name: "Egg Plates",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3c98fca2c8aa110ae5ed",
      name: "Breakfast Plates",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "675c3ca6fca2c8aa110ae5f5",
      name: "Others",
      view_type: "list",
      sort_order: 0
    }
  ],
  
  // Regular menu (10:30 AM - 10 PM daily)
  regularMenu: [
    {
      id: "675c3cb7fca2c8aa110ae5fd",
      name: "Family Deals",
      view_type: "list",
      sort_order: 1
    },
    {
      id: "675c3cc7fca2c8aa110ae605",
      name: "Starters",
      view_type: "list",
      sort_order: 2
    },
    {
      id: "675c3cd6fca2c8aa110ae60d",
      name: "Salads",
      view_type: "list",
      sort_order: 3
    },
    {
      id: "675c3ce9fca2c8aa110ae615",
      name: "Lunch Plates",
      view_type: "list",
      sort_order: 4
    },
    {
      id: "675c3d01fca2c8aa110ae61d",
      name: "Dinner Plates",
      view_type: "list",
      sort_order: 5
    },
    {
      id: "675c3d16fca2c8aa110ae625",
      name: "Especiales De La Casa",
      view_type: "list",
      sort_order: 6
    },
    {
      id: "675c3d21fca2c8aa110ae62d",
      name: "Served All Day",
      view_type: "list",
      sort_order: 7
    },
    {
      id: "675c3d40fca2c8aa110ae635",
      name: "Burgers & Sandwiches",
      view_type: "list",
      sort_order: 8
    },
    {
      id: "675c3d55fca2c8aa110ae63d",
      name: "Kids Menu",
      view_type: "list",
      sort_order: 9
    },
    {
      id: "675c3d60fca2c8aa110ae645",
      name: "A La Carte",
      view_type: "list",
      sort_order: 10
    },
    {
      id: "675c3d6cfca2c8aa110ae64d",
      name: "Beverages",
      view_type: "list",
      sort_order: 11
    },
    {
      id: "675c3d7afca2c8aa110ae655",
      name: "Dessert",
      view_type: "list",
      sort_order: 12
    }
  ],
  
  // Daily specials (rotated every evening)
  dailySpecials: {
    monday: {
      id: "675c3d86fca2c8aa110ae65d",
      name: "Monday Specials",
      view_type: "list",
      sort_order: 1
    },
    tuesday: {
      id: "675c3d93fca2c8aa110ae665",
      name: "Tuesday Specials",
      view_type: "list",
      sort_order: 1
    },
    wednesday: {
      id: "675c3da0fca2c8aa110ae66d",
      name: "Wednesday Specials",
      view_type: "list",
      sort_order: 1
    },
    thursday: {
      id: "675c3dadfca2c8aa110ae675",
      name: "Thursday Specials",
      view_type: "list",
      sort_order: 1
    },
    friday: {
      id: "675c3dbdfca2c8aa110ae67d",
      name: "Friday Specials",
      view_type: "list",
      sort_order: 1
    },
    saturday: {
      id: "675c3dcbfca2c8aa110ae685",
      name: "Saturday Specials",
      view_type: "list",
      sort_order: 1
    },
    sunday: {
      id: "675c3dd7fca2c8aa110ae68d",
      name: "Sunday Specials",
      view_type: "list",
      sort_order: 1
    }
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
 * Get tomorrow's day (for special rotation)
 */
function getTomorrowDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const centralDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const tomorrowIndex = (centralDate.getDay() + 1) % 7;
  return days[tomorrowIndex];
}

/**
 * Run weekend evening (Fri/Sat 10 PM)
 * - Rotate to tomorrow's special
 * - Turn ON breakfast categories
 * - Turn OFF regular menu
 */
async function runWeekendEvening() {
  const today = getCurrentDay();
  const tomorrow = getTomorrowDay();
  
  console.log('=== WEEKEND EVENING (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today} → Preparing for ${tomorrow} breakfast`);
  
  // Turn OFF today's special
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], false, `Turning OFF ${today}'s special`);
  }
  
  // Turn ON tomorrow's special
  const tomorrowSpecial = CATEGORIES.dailySpecials[tomorrow];
  if (tomorrowSpecial) {
    await updateCategories([tomorrowSpecial], true, `Turning ON ${tomorrow}'s special`);
  }
  
  // Turn ON breakfast categories
  await updateCategories(CATEGORIES.breakfast, true, 'Turning ON breakfast categories');
  
  // Turn OFF regular menu
  await updateCategories(CATEGORIES.regularMenu, false, 'Turning OFF regular menu');
  
  console.log('\n✓ Weekend evening prep complete!');
}

/**
 * Run weekend morning (Sat/Sun 10:30 AM)
 * - Turn ON regular menu (breakfast window ending soon)
 */
async function runWeekendMorning() {
  const today = getCurrentDay();
  
  console.log('=== WEEKEND MORNING (10:30 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Turn ON regular menu
  await updateCategories(CATEGORIES.regularMenu, true, 'Turning ON regular menu');
  
  console.log('\n✓ Weekend morning transition complete!');
}

/**
 * Run weekend breakfast end (Sat/Sun 11 AM)
 * - Turn OFF breakfast categories
 */
async function runWeekendBreakfastEnd() {
  const today = getCurrentDay();
  
  console.log('=== WEEKEND BREAKFAST END (11:00 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today}`);
  
  // Turn OFF breakfast categories
  await updateCategories(CATEGORIES.breakfast, false, 'Turning OFF breakfast categories');
  
  console.log('\n✓ Weekend breakfast service closed!');
}

/**
 * Run weekday evening (Sun-Thu 10 PM)
 * - Rotate to tomorrow's special
 * - Regular menu stays ON (no breakfast service)
 */
async function runWeekdayEvening() {
  const today = getCurrentDay();
  const tomorrow = getTomorrowDay();
  
  console.log('=== WEEKDAY EVENING (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`Day: ${today} → Rotating to ${tomorrow}'s special`);
  
  // Turn OFF today's special
  const todaySpecial = CATEGORIES.dailySpecials[today];
  if (todaySpecial) {
    await updateCategories([todaySpecial], false, `Turning OFF ${today}'s special`);
  }
  
  // Turn ON tomorrow's special
  const tomorrowSpecial = CATEGORIES.dailySpecials[tomorrow];
  if (tomorrowSpecial) {
    await updateCategories([tomorrowSpecial], true, `Turning ON ${tomorrow}'s special`);
  }
  
  console.log('\n✓ Weekday special rotation complete!');
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
    console.error('  - DOS_HERMANOS_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'weekend-evening':
      await runWeekendEvening();
      break;
    case 'weekend-morning':
      await runWeekendMorning();
      break;
    case 'weekend-breakfast-end':
      await runWeekendBreakfastEnd();
      break;
    case 'weekday-evening':
      await runWeekdayEvening();
      break;
    default:
      console.error('ERROR: Invalid action. Use one of:');
      console.error('  - weekend-evening');
      console.error('  - weekend-morning');
      console.error('  - weekend-breakfast-end');
      console.error('  - weekday-evening');
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

module.exports = { runWeekendEvening, runWeekendMorning, runWeekendBreakfastEnd, runWeekdayEvening };
