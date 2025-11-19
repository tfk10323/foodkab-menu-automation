const https = require('https');

// Configuration
const API_KEY = process.env.HYPERZOD_API_KEY;
const TENANT_ID = process.env.HYPERZOD_TENANT_ID;
const MERCHANT_ID = process.env.DOS_HERMANOS_MERCHANT_ID;

// Category IDs
const BREAKFAST_CATEGORIES = [
  '675c3c2cfca2c8aa110ae5b5', // Sides
  '675c3c3dfca2c8aa110ae5bd', // Other Items
  '675c3c49fca2c8aa110ae5c4', // From the Griddle
  '675c3c55fca2c8aa110ae5cd', // Burritos & Tacos
  '675c3c64fca2c8aa110ae5d5', // Omelettes
  '675c3c71fca2c8aa110ae5dd', // Breakfast Specials
  '675c3c83fca2c8aa110ae5e5', // Egg Plates
  '675c3c98fca2c8aa110ae5ed', // Breakfast Plates
  '675c3ca6fca2c8aa110ae5f5'  // Others
];

const REGULAR_MENU_CATEGORIES = [
  '675c3cb7fca2c8aa110ae5fd', // Family Deals
  '675c3cc7fca2c8aa110ae605', // Starters
  '675c3cd6fca2c8aa110ae60d', // Salads
  '675c3ce9fca2c8aa110ae615', // Lunch Plates
  '675c3d01fca2c8aa110ae61d', // Dinner Plates
  '675c3d16fca2c8aa110ae625', // Especiales De La Casa
  '675c3d21fca2c8aa110ae62d', // Served All Day
  '675c3d40fca2c8aa110ae635', // Burgers & Sandwiches
  '675c3d55fca2c8aa110ae63d', // Kids Menu
  '675c3d60fca2c8aa110ae645', // A La Carte
  '675c3d6cfca2c8aa110ae64d', // Beverages
  '675c3d7afca2c8aa110ae655'  // Dessert
];

const DAILY_SPECIALS = {
  'Monday': '675c3d86fca2c8aa110ae65d',
  'Tuesday': '675c3d93fca2c8aa110ae665',
  'Wednesday': '675c3da0fca2c8aa110ae66d',
  'Thursday': '675c3dadfca2c8aa110ae675',
  'Friday': '675c3dbdfca2c8aa110ae67d',
  'Saturday': '675c3dcbfca2c8aa110ae685',
  'Sunday': '675c3dd7fca2c8aa110ae68d'
};

// Helper function to make API calls
function makeApiCall(categoryId, isActive) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      merchant_id: MERCHANT_ID,
      category_id: categoryId,
      is_active: isActive
    });

    const options = {
      hostname: 'api.hyperzod.app',
      path: '/merchant/v1/catalog/category/status',
      method: 'PUT',
      headers: {
        'X-API-KEY': API_KEY,
        'X-TENANT': TENANT_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ categoryId, isActive, success: true });
        } else {
          reject(new Error(`Failed for ${categoryId}: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper to get day names in Central Time
function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Convert to Central Time (UTC-6)
  const centralDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  return days[centralDate.getDay()];
}

// Main automation logic
async function runAutomation(mode) {
  const updates = [];
  const now = new Date();
  const today = getDayName(now);
  
  console.log(`Running Dos Hermanos automation - Mode: ${mode}, Day: ${today}`);

  try {
    if (mode === 'weekend-evening') {
      // Friday or Saturday at 10 PM
      const isFriday = today === 'Friday';
      const nextDay = isFriday ? 'Saturday' : 'Sunday';
      
      console.log(`\n${today} Evening - Preparing for ${nextDay} breakfast`);
      
      // Turn OFF today's special
      updates.push(makeApiCall(DAILY_SPECIALS[today], false));
      console.log(`Turning OFF ${today} Specials`);
      
      // Turn ON next day's special
      updates.push(makeApiCall(DAILY_SPECIALS[nextDay], true));
      console.log(`Turning ON ${nextDay} Specials`);
      
      // Turn ON breakfast categories
      BREAKFAST_CATEGORIES.forEach(id => {
        updates.push(makeApiCall(id, true));
      });
      console.log(`Turning ON breakfast categories (9 categories)`);
      
      // Turn OFF regular menu
      REGULAR_MENU_CATEGORIES.forEach(id => {
        updates.push(makeApiCall(id, false));
      });
      console.log(`Turning OFF regular menu (12 categories)`);
      
    } else if (mode === 'weekend-morning') {
      // Saturday or Sunday at 10:30 AM
      console.log(`\n${today} Morning - Opening regular menu for lunch`);
      
      // Turn ON regular menu (breakfast window ending soon)
      REGULAR_MENU_CATEGORIES.forEach(id => {
        updates.push(makeApiCall(id, true));
      });
      console.log(`Turning ON regular menu (12 categories)`);
      
    } else if (mode === 'weekend-breakfast-end') {
      // Saturday or Sunday at 11:00 AM
      console.log(`\n${today} 11 AM - Closing breakfast service`);
      
      // Turn OFF breakfast categories
      BREAKFAST_CATEGORIES.forEach(id => {
        updates.push(makeApiCall(id, false));
      });
      console.log(`Turning OFF breakfast categories (9 categories)`);
      
    } else if (mode === 'weekday-evening') {
      // Sunday through Thursday at 10 PM
      const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayIndex = dayOrder.indexOf(today);
      const nextDay = dayOrder[(todayIndex + 1) % 7];
      
      console.log(`\n${today} Evening - Rotating to ${nextDay} special`);
      
      // Turn OFF today's special
      updates.push(makeApiCall(DAILY_SPECIALS[today], false));
      console.log(`Turning OFF ${today} Specials`);
      
      // Turn ON next day's special
      updates.push(makeApiCall(DAILY_SPECIALS[nextDay], true));
      console.log(`Turning ON ${nextDay} Specials`);
      
      // Note: Regular menu stays ON, no breakfast service on weekdays
    }

    // Execute all updates
    const results = await Promise.all(updates);
    
    console.log(`\n✅ Successfully completed ${results.length} category updates`);
    console.log('Dos Hermanos menu automation complete!\n');
    
  } catch (error) {
    console.error('❌ Error during automation:', error.message);
    process.exit(1);
  }
}

// Get mode from command line argument
const mode = process.argv[2];
const validModes = ['weekend-evening', 'weekend-morning', 'weekend-breakfast-end', 'weekday-evening'];

if (!mode || !validModes.includes(mode)) {
  console.error('Usage: node dos-hermanos-automation.js <mode>');
  console.error('Valid modes: weekend-evening, weekend-morning, weekend-breakfast-end, weekday-evening');
  process.exit(1);
}

runAutomation(mode);
