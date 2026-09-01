import { DisasterType } from "./disasters";

export interface Guide {
  id: string;
  type: DisasterType;
  title: string;
  before: string[];
  during: string[];
  after: string[];
}

export const DEFAULT_GUIDES: Guide[] = [
  {
    id: "guide-1",
    type: "Flood",
    title: "Flood Safety Guide",
    before: [
      "Keep emergency supplies ready (water, food, flashlight, first-aid kit).",
      "Know your evacuation routes to higher ground.",
      "Store important documents in waterproof containers.",
      "Monitor weather alerts and river levels.",
      "Move vehicles to higher ground if possible.",
    ],
    during: [
      "Move to higher ground immediately. Do not wait for instructions.",
      "Avoid walking or driving through floodwaters.",
      "Do not touch electrical equipment if wet or standing in water.",
      "If trapped in a building, go to the highest floor. Do not climb into a closed attic.",
      "Listen to emergency broadcasts for updates.",
    ],
    after: [
      "Return only when authorities say it is safe.",
      "Avoid floodwater — it may be contaminated or electrically charged.",
      "Document damage with photos for insurance claims.",
      "Boil or purify water before drinking.",
      "Check for structural damage before re-entering buildings.",
    ],
  },
  {
    id: "guide-2",
    type: "Earthquake",
    title: "Earthquake Safety Guide",
    before: [
      "Secure heavy furniture, shelves, and water heaters to walls.",
      "Identify safe spots in each room (under sturdy tables, against interior walls).",
      "Prepare an emergency kit with water, food, and first-aid supplies.",
      "Practice Drop, Cover, and Hold On drills.",
      "Know how to shut off gas, water, and electricity.",
    ],
    during: [
      "Drop, Cover, and Hold On. Get under a sturdy table or desk.",
      "Stay away from windows, heavy furniture, and exterior walls.",
      "If outdoors, move to an open area away from buildings.",
      "If driving, pull over and stay in the vehicle.",
      "Be prepared for aftershocks.",
    ],
    after: [
      "Check for injuries and administer first aid.",
      "Inspect your home for structural damage before re-entering.",
      "Avoid using damaged elevators.",
      "If you smell gas, leave the building and report it.",
      "Monitor aftershock alerts and follow authority instructions.",
    ],
  },
  {
    id: "guide-3",
    type: "Cyclone",
    title: "Cyclone Safety Guide",
    before: [
      "Board up windows and secure outdoor objects.",
      "Stock up on food, water, and emergency supplies for at least 3 days.",
      "Identify the nearest cyclone shelter.",
      "Fill bathtubs and large containers with clean water.",
      "Charge all mobile devices and keep a battery-powered radio.",
    ],
    during: [
      "Stay indoors in a sturdy building away from windows.",
      "Do not go outside during the eye of the storm — it is temporary.",
      "If the building begins to fail, move to the safest interior room.",
      "Avoid using candles — use flashlights instead.",
      "Keep listening to emergency broadcasts.",
    ],
    after: [
      "Wait for official all-clear before going outside.",
      "Watch for fallen power lines, broken gas lines, and debris.",
      "Avoid walking through floodwaters.",
      "Report damage to local authorities.",
      "Help neighbours who may need assistance.",
    ],
  },
  {
    id: "guide-4",
    type: "Wildfire",
    title: "Wildfire Safety Guide",
    before: [
      "Create a defensible space around your home (clear dry vegetation).",
      "Prepare a go-bag with essentials and important documents.",
      "Know at least two evacuation routes.",
      "Keep garden hoses connected and accessible.",
      "Sign up for local fire alerts.",
    ],
    during: [
      "Evacuate immediately if ordered to do so.",
      "Close all windows and doors to slow fire spread.",
      "Wear long sleeves and a mask to protect from smoke.",
      "If caught in smoke, stay low and cover your mouth.",
      "Do not attempt to fight the fire yourself.",
    ],
    after: [
      "Do not return until authorities say it is safe.",
      "Check your home carefully for smouldering embers.",
      "Avoid driving through damaged areas.",
      "Document all damage for insurance purposes.",
      "Be cautious of weakened trees and hotspots.",
    ],
  },
  {
    id: "guide-5",
    type: "Landslide",
    title: "Landslide Safety Guide",
    before: [
      "Avoid building on steep slopes or near cliff edges.",
      "Know the landslide risk areas in your region.",
      "Install flexible pipe fittings to reduce breakage.",
      "Watch for signs: cracks in ground, leaning trees, unusual water flow.",
      "Prepare an evacuation kit.",
    ],
    during: [
      "Move to higher ground away from the path of the landslide.",
      "Do not try to outrun a landslide in a vehicle.",
      "If trapped, cover your head and protect it from debris.",
      "Listen for unusual sounds like cracking trees or rumbling earth.",
      "Stay away from river valleys during heavy rainfall.",
    ],
    after: [
      "Stay away from the slide area until cleared by authorities.",
      "Check for injured people and provide first aid.",
      "Watch for flooding — landslides can dam rivers.",
      "Report blocked roads and damaged utilities.",
      "Inspect your property before re-entering.",
    ],
  },
  {
    id: "guide-6",
    type: "Conflict",
    title: "Conflict / Civilian Emergency Guide",
    before: [
      "Identify nearby civilian shelters and safe buildings.",
      "Keep an emergency bag ready with documents, water, and first-aid supplies.",
      "Stay informed through official sources — avoid rumours.",
      "Plan meeting points with family members.",
      "Know the location of the nearest hospital.",
    ],
    during: [
      "Move to a designated civilian shelter or safe building.",
      "Stay away from windows and exterior walls.",
      "Keep low and stay out of sight.",
      "Do not gather in large groups in open areas.",
      "Follow instructions from emergency services.",
    ],
    after: [
      "Wait for official all-clear before leaving shelter.",
      "Check on neighbours and provide assistance if safe.",
      "Avoid damaged or unstable structures.",
      "Report any unexploded items to authorities immediately.",
      "Seek medical attention for any injuries.",
    ],
  },
];
