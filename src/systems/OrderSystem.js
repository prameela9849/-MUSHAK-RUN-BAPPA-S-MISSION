// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - ORDER SYSTEM
// Sequential Ganesha orders strictly without numerical quantities
// ==========================================================================

export const GANESHA_ORDERS = [
  {
    id: 1,
    dialogue: "Mushak, bring me the Modaks.",
    name: "Sacred Modaks",
    shortName: "Modaks",
    type: "modak",
    icon: "🍬",
    color: 0xFFD700,
    desc: "Collect delicious golden modaks lovingly prepared for Bappa's Puja!",
    itemPointValue: 100
  },
  {
    id: 2,
    dialogue: "Mushak, bring me the Diyas.",
    name: "Festive Diyas",
    shortName: "Diyas",
    type: "diya",
    icon: "🪔",
    color: 0xFF6D00,
    desc: "Collect radiant terracotta lamps to illuminate the festival path!",
    itemPointValue: 100
  },
  {
    id: 3,
    dialogue: "Mushak, bring me the Flags.",
    name: "Festival Flags",
    shortName: "Flags",
    type: "flag",
    icon: "🚩",
    color: 0xFF3D00,
    desc: "Collect auspicious saffron and golden pataka flags for the temple mandap!",
    itemPointValue: 100
  },
  {
    id: 4,
    dialogue: "Mushak, bring me the Flowers.",
    name: "Puja Flowers",
    shortName: "Flowers",
    type: "flower",
    icon: "🌺",
    color: 0xE91E63,
    desc: "Collect fragrant marigolds and sacred lotus blooms for Ganesha's garland!",
    itemPointValue: 100
  },
  {
    id: 5,
    dialogue: "Mushak, bring the Puja items.",
    name: "Sacred Puja Items",
    shortName: "Puja Items",
    type: "puja",
    icon: "🪷",
    color: 0x00E5FF,
    desc: "Collect holy Kalash pots, ghanta bells, and aarti thalis!",
    itemPointValue: 100
  },
  {
    id: 6,
    dialogue: "Mushak, prepare the festival decorations.",
    name: "Mandap Decorations",
    shortName: "Decorations",
    type: "rangoli",
    icon: "✨",
    color: 0x76FF03,
    desc: "Collect festive rangoli stars and decorative torans for the celebrations!",
    itemPointValue: 100
  },
  {
    id: 7,
    dialogue: "Mushak, bring the items needed for the celebration.",
    name: "Celebration Prasad",
    shortName: "Celebration Items",
    type: "celebration",
    icon: "🥥",
    color: 0x8D6E63,
    desc: "Collect sacred coconuts, mango leaves, and festive sweets for all devotees!",
    itemPointValue: 100
  }
];

export class OrderSystem {
  constructor() {
    const savedIdx = parseInt(localStorage.getItem('mushak_order_index') || '0', 10);
    this.currentIndex = (!isNaN(savedIdx) && savedIdx >= 0) ? savedIdx % GANESHA_ORDERS.length : 0;
  }

  getCurrentOrder() {
    return GANESHA_ORDERS[this.currentIndex];
  }

  getNextOrder() {
    const nextIdx = (this.currentIndex + 1) % GANESHA_ORDERS.length;
    return GANESHA_ORDERS[nextIdx];
  }

  // Advance to next order in sequence when a run ends
  advanceOrder() {
    this.currentIndex = (this.currentIndex + 1) % GANESHA_ORDERS.length;
    localStorage.setItem('mushak_order_index', this.currentIndex.toString());
    return this.getCurrentOrder();
  }

  getOrderProgressText() {
    return `Mission ${this.currentIndex + 1} of ${GANESHA_ORDERS.length}`;
  }

  resetOrderProgress() {
    this.currentIndex = 0;
    localStorage.setItem('mushak_order_index', '0');
  }
}

export const orderSystem = new OrderSystem();
