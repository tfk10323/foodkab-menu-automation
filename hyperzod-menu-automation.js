/**
 * Hyperzod Menu Category Automation
 * Automatically shows/hides menu categories based on time of day
 * 
 * Schedule:
 * - 10:00 PM: Turn off lunch/dinner, turn on breakfast
 * - 10:30 AM: Turn on lunch/dinner and daily specials
 * - 11:00 AM: Turn off breakfast
 */

const HYPERZOD_CONFIG = {
  baseUrl: 'https://api.hyperzod.app',
  apiKey: process.env.HYPERZOD_API_KEY,
  tenantId: process.env.HYPERZOD_TENANT_ID,
  merchantId: process.env.HYPERZOD_MERCHANT_ID
};

// Category IDs for 3-W's Smoke Shack
const CATEGORIES = {
  // Always visible - never touched
  alwaysOn: [
    {
      id: "67b8f55855cb270ecf0a73c2",
      name: "(OPTIONAL) Tip Your To-Go Team!",
      view_type: "list",
      sort_order: 0
    }
  ],
  
  // Breakfast window (10 PM - 11 AM)
  breakfast: [
    {
      id: "6863da7e07399a9b6c0f3222",
      name: "Breakfast",
      view_type: "list",
      sort_order: 0
    },
    {
      id: "6863da7f07399a9b6c0f322a",
      name: "Kids Menu",
      view_type: "list",
      sort_order: 0
    }
  ],
  
  // Daily specials (10:30 AM - 10 PM on respective days)
  dailySpecials: {
    tuesday: {
      id: "68ff70322b04928f7e00a6eb",
      name: "Tuesday Specials",
      view_type: "list",
      sort_order: 1
    },
    wednesday: {
      id: "68ff703b2b04928f7e00a6ec",
      name: "Wednesday Specials",
      view_type: "list",
      sort_order: 1
    },
    thursday: {
      id: "68ff70432b04928f7e00a6ed",
      name: "Thursday Specials",
      view_type: "list",
      sort_order: 1
    },
    friday: {
      id: "68ff704e2b04928f7e00a6ee",
      name: "Friday Specials",
      view_type: "list",
      sort_order: 1
    },
    saturday: {
      id: "68ff70572b04928f7e00a6ef",
      name: "Saturday Specials",
      view_type: "list",
      sort_order: 1
    }
  },
  
  // Regular menu (10:30 AM - 10 PM daily)
  regularMenu: [
    {
      id: "67b8f54c55cb270ecf0a7352",
      name: "Family Packs",
      view_type: "list",
      sort_order: 2
    },
    {
      id: "67b8f54d55cb270ecf0a7367",
      name: "Chicken Tenders",
      view_type: "list",
      sort_order: 2
    },
    {
      id: "67b8f54d55cb270ecf0a7359",
      name: "Meat Options",
      view_type: "list",
      sort_order: 3
    },
    {
      id: "67b8f55255cb270ecf0a7387",
      name: "Meat Plates",
      view_type: "list",
      sort_order: 4
    },
    {
      id: "67b8f54e55cb270ecf0a7373",
      name: "Wings",
      view_type: "list",
      sort_order: 5
    },
    {
      id: "67b8f54e55cb270ecf0a736a",
      name: "Smaller Plates",
      view_type: "list",
      sort_order: 7
    },
    {
      id: "67b8f55055cb270ecf0a737b",
      name: "Sandwiches",
      view_type: "list",
      sort_order: 8
    },
    {
      id: "67b8f55355cb270ecf0a738f",
      name: "Burgers",
      view_type: "list",
      sort_order: 10
    },
    {
      id: "67b8f55455cb270ecf0a7393",
      name: "Sides",
      view_type: "list",
      sort_order: 11
    },
    {
      id: "67b8f54f55cb270ecf0a7376",
      name: "More Items",
      view_type: "list",
      sort_order: 12
    },
    {
      id: "67b8f55755cb270ecf0a73ac",
      name: "Drinks",
      view_type: "list",
      sort_order: 13
    },
    {
      id: "67b8f55655cb270ecf0a73a7",
      name: "Desserts",
      view_type: "list",
      sort_order: 14
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
 * Get current day of week (lowercase)
 */
function getCurrentDay() {
     const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
     const centralDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
     return days[centralDate.getDay()];
   }

/**
 * Run the evening flip (10 PM)
 * Turn OFF: lunch/dinner/specials
 * Turn ON: breakfast
 */
async function runEveningFlip() {
  console.log('=== EVENING FLIP (10:00 PM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  
  // Turn OFF all daily specials
  const allSpecials = Object.values(CATEGORIES.dailySpecials);
  await updateCategories(allSpecials, false, 'Turning OFF daily specials');
  
  // Turn OFF regular menu
  await updateCategories(CATEGORIES.regularMenu, false, 'Turning OFF regular menu');
  
  // Turn ON breakfast
  await updateCategories(CATEGORIES.breakfast, true, 'Turning ON breakfast');
  
  console.log('\n✓ Evening flip complete!');
}

/**
 * Run the morning lunch start (10:30 AM)
 * Turn ON: lunch/dinner and today's special
 */
async function runMorningLunchStart() {
  console.log('=== MORNING LUNCH START (10:30 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  
  // Turn ON regular menu
  await updateCategories(CATEGORIES.regularMenu, true, 'Turning ON regular menu');
  
  // Turn ON today's special (if it exists)
  const today = getCurrentDay();
  const todaySpecial = CATEGORIES.dailySpecials[today];
  
  if (todaySpecial) {
    await updateCategories([todaySpecial], true, `Turning ON ${today}'s special`);
  } else {
    console.log(`\nNo special for ${today} (store likely closed)`);
  }
  
  console.log('\n✓ Morning lunch start complete!');
}

/**
 * Run the breakfast end (11:00 AM)
 * Turn OFF: breakfast
 */
async function runBreakfastEnd() {
  console.log('=== BREAKFAST END (11:00 AM) ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
  
  // Turn OFF breakfast
  await updateCategories(CATEGORIES.breakfast, false, 'Turning OFF breakfast');
  
  console.log('\n✓ Breakfast end complete!');
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
    console.error('  - HYPERZOD_MERCHANT_ID');
    process.exit(1);
  }
  
  // Determine which action to run based on argument
  const action = process.argv[2];
  
  switch(action) {
    case 'evening-flip':
      await runEveningFlip();
      break;
    case 'morning-lunch':
      await runMorningLunchStart();
      break;
    case 'breakfast-end':
      await runBreakfastEnd();
      break;
    default:
      console.error('ERROR: Invalid action. Use one of:');
      console.error('  - evening-flip');
      console.error('  - morning-lunch');
      console.error('  - breakfast-end');
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

module.exports = { runEveningFlip, runMorningLunchStart, runBreakfastEnd };
