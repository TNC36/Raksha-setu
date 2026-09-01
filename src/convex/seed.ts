/**
 * Seed function to populate the database with demo disaster data.
 * Call this ONCE after first deployment to populate guides, helplines, alerts, and safe zones.
 *
 * Usage: From Convex dashboard or via `npx convex run seed:seedAll`
 */
import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingGuides = await ctx.db.query("guides").first();
    if (existingGuides) {
      return { message: "Database already seeded. Skipping." };
    }

    const now = Date.now();

    // ── GUIDES ──────────────────────────────────────────────
    const guides = [
      {
        type: "Flood" as const,
        title: "Flood Safety Guide",
        before: [
          "Know your flood risk — check if you live in a flood-prone area",
          "Keep emergency supplies ready: water, food, flashlight, batteries, first-aid kit",
          "Download the Raksha Setu app for real-time alerts",
          "Identify evacuation routes and safe zones near your home",
          "Keep important documents in a waterproof container",
          "Charge your phone and keep a power bank ready",
          "Know the emergency helpline numbers",
        ],
        during: [
          "Move to higher ground immediately if water is rising",
          "Do NOT walk or drive through flooded roads — turn around, don't drown",
          "Stay away from bridges over fast-moving water",
          "If trapped in a building, go to the highest floor, not the attic",
          "Call 112 (National Emergency) or 1070 (NDRF) for rescue",
          "Keep your phone charged and share your location with family",
          "Listen to official radio or TV for updates",
        ],
        after: [
          "Do NOT return home until authorities say it is safe",
          "Check for structural damage before entering buildings",
          "Boil water before drinking — tap water may be contaminated",
          "Document damage with photos for insurance claims",
          "Clean and disinfect everything that got wet",
          "Watch for snakes and other wildlife displaced by floods",
          "Seek medical help if injured or feeling unwell",
        ],
      },
      {
        type: "Earthquake" as const,
        title: "Earthquake Safety Guide",
        before: [
          "Secure heavy furniture, water heaters, and appliances to walls",
          "Know the safest spots in each room: under sturdy tables, against interior walls",
          "Keep an emergency kit with water, food, flashlight, and first-aid supplies",
          "Practice Drop, Cover, and Hold On drills with your family",
          "Know how to shut off gas, water, and electricity",
          "Identify safe open areas near your home for evacuation",
        ],
        during: [
          "DROP to the ground immediately",
          "COVER your head and neck under a sturdy table or desk",
          "HOLD ON until the shaking stops",
          "If outdoors, move to a clear area away from buildings and power lines",
          "If driving, pull over to a clear spot and stay in the car",
          "Do NOT stand in a doorway — that is an outdated myth",
          "Stay away from windows, outer walls, and heavy objects",
        ],
        after: [
          "Check yourself and others for injuries — provide first aid if needed",
          "Check for gas leaks and fire — do NOT use open flames",
          "Be prepared for aftershocks",
          "If building is damaged, evacuate to open ground",
          "Listen to official instructions on radio or TV",
          "Do NOT use elevators",
          "Check Raksha Setu for updated safe zone information",
        ],
      },
      {
        type: "Cyclone" as const,
        title: "Cyclone Safety Guide",
        before: [
          "Monitor weather alerts from IMD and Raksha Setu",
          "Board up windows with plywood or storm shutters",
          "Stock emergency supplies: water, non-perishable food, medicines for 3-5 days",
          "Identify the nearest cyclone shelter",
          "Trim trees and secure loose outdoor objects",
          "Fill vehicles with fuel and withdraw cash",
          "Keep important documents in waterproof bags",
        ],
        during: [
          "Stay indoors in an interior room away from windows",
          "Do NOT go outside during the eye of the cyclone — the storm will resume",
          "Turn off electricity at the main switch if instructed",
          "If flooding starts, move to higher floors immediately",
          "Keep listening to radio for official updates",
          "Do NOT use candles — use battery-powered lights",
          "Stay away from the coast and riverbanks",
        ],
        after: [
          "Do NOT venture out until authorities give the all-clear",
          "Watch for fallen power lines and report them to authorities",
          "Avoid floodwater — it may be electrically charged or contaminated",
          "Check on neighbors, especially elderly and children",
          "Report damage and request help through Raksha Setu",
          "Do not eat food that has come in contact with floodwater",
        ],
      },
      {
        type: "Wildfire" as const,
        title: "Wildfire Safety Guide",
        before: [
          "Create a defensible space around your home by clearing dry vegetation",
          "Keep gutters and roofs clear of leaves and debris",
          "Have an evacuation plan and identify two exit routes from your neighborhood",
          "Prepare a go-bag with essentials: documents, medications, phone, charger",
          "Know your local fire station and emergency numbers",
          "Install smoke detectors and check batteries regularly",
        ],
        during: [
          "Evacuate immediately if ordered — do NOT wait",
          "Close all windows and doors but leave unlocked for firefighters",
          "Turn off gas and propane tanks",
          "Wear long sleeves, long pants, and sturdy shoes",
          "Cover your mouth with a wet cloth to filter smoke",
          "Drive with headlights on and stay on main roads",
          "If trapped: lie flat in a cleared area, cover yourself with non-synthetic blanket",
        ],
        after: [
          "Do NOT return home until authorities declare it safe",
          "Check for hot spots and smoldering debris near your home",
          "Be cautious of weakened trees and power lines",
          "Document damage with photos for insurance",
          "Watch for wildlife displaced by the fire",
          "Seek medical attention for any smoke inhalation symptoms",
        ],
      },
      {
        type: "Landslide" as const,
        title: "Landslide Safety Guide",
        before: [
          "Learn about landslide risk in your area — check geological surveys",
          "Do not build or live on steep slopes or at the base of cliffs",
          "Watch for warning signs: cracks in ground, tilted trees, unusual water flow",
          "Have an evacuation plan for your area",
          "Keep emergency supplies ready",
          "Ensure proper drainage around your home",
        ],
        during: [
          "Move away from the landslide path — go sideways, not downhill",
          "If a landslide is approaching, move to higher ground",
          "If trapped, curl into a ball and protect your head",
          "Listen for unusual sounds like trees cracking or boulders hitting",
          "If driving, do NOT try to outrun a landslide — leave the vehicle and move uphill",
        ],
        after: [
          "Stay away from the slide area until authorities confirm it is safe",
          "Check for injured people and provide first aid",
          "Report the landslide to authorities and on Raksha Setu",
          "Watch for additional slides — the area may still be unstable",
          "Check for damaged utilities: gas, water, electricity",
        ],
      },
      {
        type: "Conflict" as const,
        title: "Civil Unrest Safety Guide",
        before: [
          "Stay informed about local security situations",
          "Know the safest routes to and from your home and workplace",
          "Keep emergency contacts saved and accessible",
          "Have a family communication plan",
          "Keep a small emergency kit at home",
          "Stay away from protest areas and large gatherings when possible",
        ],
        during: [
          "Move away from the affected area immediately",
          "Seek shelter in a secure building away from the conflict zone",
          "Stay indoors and keep windows and doors locked",
          "Do NOT film or photograph protests — it may put you at risk",
          "Call 100 (Police) or 112 (Emergency) if in danger",
          "Keep your phone charged and inform family of your location",
          "Avoid wearing anything that identifies you with any group",
        ],
        after: [
          "Do NOT return to the affected area until authorities say it is safe",
          "Check on neighbors and family members",
          "Report any injuries or missing persons to authorities",
          "Document any property damage",
          "Seek medical help if injured",
          "Contact local authorities through Raksha Setu if you need assistance",
        ],
      },
    ];

    for (const guide of guides) {
      await ctx.db.insert("guides", guide);
    }

    // ── HELPLINES ───────────────────────────────────────────
    const helplines = [
      { name: "National Emergency Number", phone: "112", description: "Universal emergency number for police, fire, ambulance" },
      { name: "Police", phone: "100", description: "Police emergency" },
      { name: "Fire Brigade", phone: "101", description: "Fire emergency" },
      { name: "Ambulance", phone: "108", description: "Medical emergency / ambulance" },
      { name: "NDRF (Disaster Response)", phone: "1070", description: "National Disaster Response Force" },
      { name: "NDMA Helpline", phone: "1078", description: "National Disaster Management Authority" },
      { name: "Women Helpline", phone: "1091", description: "Women in distress" },
      { name: "Child Helpline", phone: "1098", description: "Child emergency / abuse reporting" },
      { name: "Gas Leak Emergency", phone: "1906", description: "LPG gas leak emergency" },
      { name: "Coast Guard", phone: "1554", description: "Maritime emergency" },
    ];

    for (const hl of helplines) {
      await ctx.db.insert("helplines", hl);
    }

    // ── DEMO ALERTS ─────────────────────────────────────────
    const alerts = [
      {
        type: "Flood" as const,
        severity: "Critical" as const,
        title: "Severe Flood Warning — Vadodara District",
        description: "Heavy rainfall has caused severe flooding in Vadodara district. Vishwamitri River is above danger mark. Residents in low-lying areas must evacuate immediately. Avoid underpasses and low-lying roads.",
        location: "Vadodara, Gujarat",
        latitude: 23.0225,
        longitude: 72.5714,
        radius: 5000,
        source: "Demo —模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 86400000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
      {
        type: "Earthquake" as const,
        severity: "High" as const,
        title: "Magnitude 5.1 Earthquake — Kutch Region",
        description: "A 5.1 magnitude earthquake was recorded near Bhuj, Kutch. No tsunami warning issued. Residents should check buildings for structural damage and be prepared for aftershocks.",
        location: "Kutch, Gujarat",
        latitude: 23.2518,
        longitude: 69.6670,
        radius: 3000,
        source: "Demo — 模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 43200000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
      {
        type: "Cyclone" as const,
        severity: "High" as const,
        title: "Cyclone Warning — Gujarat Coast",
        description: "A deep depression over the Arabian Sea is intensifying into a cyclone. Expected to impact Gujarat coast within 48 hours. Fishermen are advised not to venture into the sea.",
        location: "Gujarat Coast",
        latitude: 20.9517,
        longitude: 70.4033,
        radius: 8000,
        source: "Demo — 模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 172800000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
      {
        type: "Landslide" as const,
        severity: "Medium" as const,
        title: "Landslide Risk Alert — Hill Road",
        description: "Continuous heavy rainfall has destabilized slopes along the hill road. Travel on hilly routes is advised against. Move to stable evacuation areas if in the vicinity.",
        location: "Western Ghats, Maharashtra",
        latitude: 19.0760,
        longitude: 72.8777,
        radius: 2000,
        source: "Demo — 模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 86400000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
      {
        type: "Flood" as const,
        severity: "High" as const,
        title: "Flash Flood Warning — Chennai",
        description: "IMD has issued a red alert for Chennai. Extremely heavy rainfall expected. Low-lying areas may experience waterlogging. Residents should stay indoors.",
        location: "Chennai, Tamil Nadu",
        latitude: 13.0827,
        longitude: 80.2707,
        radius: 4000,
        source: "Demo — 模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 86400000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
      {
        type: "Wildfire" as const,
        severity: "Medium" as const,
        title: "Forest Fire Alert — Uttarakhand",
        description: "Multiple forest fires reported in Uttarakhand. Air quality may deteriorate. Avoid travel to affected areas. Keep windows closed.",
        location: "Uttarakhand",
        latitude: 30.0668,
        longitude: 79.0193,
        radius: 6000,
        source: "Demo — 模拟数据",
        sourceUrl: undefined,
        sourceId: undefined,
        issuedAt: now,
        updatedAt: now,
        expiresAt: now + 259200000,
        status: "active" as const,
        mode: "demo" as const,
        verified: false,
      },
    ];

    for (const alert of alerts) {
      await ctx.db.insert("alerts", alert);
    }

    // ── SAFE ZONES ──────────────────────────────────────────
    const safeZones = [
      {
        name: "Vadodara Municipal School Shelter",
        type: "Shelter",
        location: "Near Fatehgunj, Vadodara, Gujarat",
        latitude: 23.0300,
        longitude: 72.5600,
        capacity: 500,
        disasterTypes: ["Flood" as const, "Earthquake" as const],
        status: "Available" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
      {
        name: "Gujarat Sports Complex Relief Center",
        type: "Shelter",
        location: "Moti Bagh, Vadodara, Gujarat",
        latitude: 23.0250,
        longitude: 72.5800,
        capacity: 1000,
        disasterTypes: ["Flood" as const, "Cyclone" as const, "Earthquake" as const],
        status: "Available" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
      {
        name: "Kutch District Relief Camp",
        type: "Shelter",
        location: "Bhuj, Kutch, Gujarat",
        latitude: 23.2514,
        longitude: 69.6669,
        capacity: 800,
        disasterTypes: ["Earthquake" as const, "Cyclone" as const],
        status: "Available" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
      {
        name: "Mumbai Civil Defence Shelter",
        type: "Shelter",
        location: "Worli, Mumbai, Maharashtra",
        latitude: 19.0020,
        longitude: 72.8160,
        capacity: 2000,
        disasterTypes: ["Flood" as const, "Cyclone" as const],
        status: "Available" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
      {
        name: "Chennai Disaster Relief Center",
        type: "Shelter",
        location: "T. Nagar, Chennai, Tamil Nadu",
        latitude: 13.0400,
        longitude: 80.2300,
        capacity: 600,
        disasterTypes: ["Flood" as const, "Cyclone" as const],
        status: "Limited" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
      {
        name: "Delhi NDRF Station Shelter",
        type: "Shelter",
        location: "Civil Lines, Delhi",
        latitude: 28.6815,
        longitude: 77.2280,
        capacity: 1500,
        disasterTypes: ["Flood" as const, "Earthquake" as const, "Conflict" as const],
        status: "Available" as const,
        verified: true,
        source: "Demo",
        mode: "demo" as const,
      },
    ];

    for (const zone of safeZones) {
      await ctx.db.insert("safeZones", zone);
    }

    return {
      message: "Database seeded successfully!",
      counts: {
        guides: guides.length,
        helplines: helplines.length,
        alerts: alerts.length,
        safeZones: safeZones.length,
      },
    };
  },
});
