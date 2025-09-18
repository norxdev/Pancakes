// --- Armor Sets ---
const armorSetsData = [
  // Sunfire & Moon Sets
  {
    name: "Sunfire Fanatic Armour Set",
    items: [
      { name: "Helm", id: "28933", imgName: "Sunfire_fanatic_helm" },
      { name: "Cuirass", id: "28936", imgName: "Sunfire_fanatic_cuirass" },
      { name: "Chausses", id: "28939", imgName: "Sunfire_fanatic_chausses" }
    ],
    setId: "29424",
    setImgName: "Sunfire_fanatic_armour_set"
  },
  {
    name: "Blood Moon Armour Set",
    items: [
      { name: "Chestplate", id: "29022", imgName: "Blood_moon_chestplate_detail" },
      { name: "Helm", id: "29028", imgName: "Blood_moon_helm_detail" },
      { name: "Tassets", id: "29025", imgName: "Blood_moon_tassets_detail" },
      { name: "Dual Macuahuitl", id: "28997", imgName: "Dual_macuahuitl_detail" }
    ],
    setId: "31136",
    setImgName: "Blood_moon_armour_set_detail"
  },
  {
    name: "Blue Moon Armour Set",
    items: [
      { name: "Chestplate", id: "29013", imgName: "Blue_moon_chestplate_detail" },
      { name: "Helm", id: "29019", imgName: "Blue_moon_helm_detail" },
      { name: "Spear", id: "28988", imgName: "Blue_moon_spear_detail" },
      { name: "Tassets", id: "29016", imgName: "Blue_moon_tassets_detail" }
    ],
    setId: "31139",
    setImgName: "Blue_moon_armour_set_detail"
  },
  {
    name: "Eclipse Moon Armour Set",
    items: [
      { name: "Chestplate", id: "29004", imgName: "Eclipse_moon_chestplate_detail" },
      { name: "Helm", id: "29010", imgName: "Eclipse_moon_helm_detail" },
      { name: "Tassets", id: "29007", imgName: "Eclipse_moon_tassets_detail" },
      { name: "Atlatl", id: "29000", imgName: "Eclipse_atlatl_detail" }
    ],
    setId: "31142",
    setImgName: "Eclipse_moon_armour_set_detail"
  },

  // Ancestral Robes Set
  {
    name: "Ancestral Robes Set",
    items: [
      { name: "Ancestral hat", id: "21018", imgName: "Ancestral_hat" },
      { name: "Ancestral robe top", id: "21021", imgName: "Ancestral_robe_top" },
      { name: "Ancestral robe bottom", id: "21024", imgName: "Ancestral_robe_bottom" }
    ],
    setId: "21049",
    setImgName: "Ancestral_robes_set"
  },

// Inquisitor's Armour Set
{
  name: "Inquisitor's Armour Set",
  items: [
    { name: "Inquisitor's great helm", id: "24419", imgName: "Inquisitor's_great_helm" },
    { name: "Inquisitor's hauberk", id: "24420", imgName: "Inquisitor's_hauberk" },
    { name: "Inquisitor's plateskirt", id: "24421", imgName: "Inquisitor's_plateskirt" },
  ],
  setId: "24488",
  setImgName: "Inquisitor's_armour_set_detail",
  layout: "vertical" // optional flag for rendering vertically like wiki
},


  // Dagon'hai Robes Set
  {
    name: "Dagon'hai Robes Set",
    items: [
      { name: "Dagon'hai hat", id: "24288", imgName: "Dagon'hai_hat_detail" },
      { name: "Dagon'hai robe top", id: "24291", imgName: "Dagon'hai_robe_top_detail" },
      { name: "Dagon'hai robe bottom", id: "24294", imgName: "Dagon'hai_robe_bottom_detail" }
    ],
    setId: "24333",
    setImgName: "Dagon'hai_robes_set_detail"
  },

  // Justiciar Armour Set
  {
    name: "Justiciar Armour Set",
    items: [
      { name: "Justiciar faceguard", id: "22326", imgName: "Justiciar_faceguard" },
      { name: "Justiciar chestguard", id: "22327", imgName: "Justiciar_chestguard" },
      { name: "Justiciar legguards", id: "22328", imgName: "Justiciar_legguards" }
    ],
    setId: "22438",
    setImgName: "Justiciar_armour_set"
  },

  // Oathplate Armour Set
  {
    name: "Oathplate Armour Set",
    items: [
      { name: "Oathplate helm", id: "30750", imgName: "Oathplate_helm" },
      { name: "Oathplate chest", id: "30753", imgName: "Oathplate_chest" },
      { name: "Oathplate legs", id: "30756", imgName: "Oathplate_legs" }
    ],
    setId: "30744",
    setImgName: "Oathplate_armour_set"
  },

  // Obsidian Armour Set
  {
    name: "Obsidian Armour Set",
    items: [
      { name: "Obsidian helmet", id: "21298", imgName: "Obsidian_helmet" },
      { name: "Obsidian platebody", id: "21301", imgName: "Obsidian_platebody" },
      { name: "Obsidian platelegs", id: "21304", imgName: "Obsidian_platelegs" }
    ],
    setId: "21279",
    setImgName: "Obsidian_armour_set"
  },

  // Virtus Armour Set
  {
    name: "Virtus Armour Set",
    items: [
      { name: "Virtus mask", id: "26241", imgName: "Virtus_mask" },
      { name: "Virtus robe top", id: "26243", imgName: "Virtus_robe_top" },
      { name: "Virtus robe bottom", id: "26245", imgName: "Virtus_robe_bottom" }
    ],
    setId: "31148",
    setImgName: "Virtus_armour_set"
  },

  // Dragonstone Armour Set
  {
    name: "Dragonstone Armour Set",
    items: [
      { name: "Dragonstone full helm", id: "24034", imgName: "Dragonstone_full_helm" },
      { name: "Dragonstone platebody", id: "24037", imgName: "Dragonstone_platebody" },
      { name: "Dragonstone platelegs", id: "24040", imgName: "Dragonstone_platelegs" },
      { name: "Dragonstone gauntlets", id: "24046", imgName: "Dragonstone_gauntlets" }
    ],
    setId: "23667",
    setImgName: "Dragonstone_armour_set"
  },

  // Masori Armour Set (f)
  {
    name: "Masori Armour Set (f)",
    items: [
      { name: "Masori mask (f)", id: "27235", imgName: "Masori_mask_(f)_detail" },
      { name: "Masori body (f)", id: "27238", imgName: "Masori_body_(f)_detail" },
      { name: "Masori chaps (f)", id: "27241", imgName: "Masori_chaps_(f)_detail" }
    ],
    setId: "27355",
    setImgName: "Masori_armour_set_(f)_detail"
  },

  // Hueycoatl Hide Armour Set
  {
    name: "Hueycoatl Hide Armour Set",
    items: [
      { name: "Hueycoatl hide coif", id: "30073", imgName: "Hueycoatl_hide_coif" },
      { name: "Hueycoatl hide body", id: "30076", imgName: "Hueycoatl_hide_body" },
      { name: "Hueycoatl hide chaps", id: "30079", imgName: "Hueycoatl_hide_chaps" },
      { name: "Hueycoatl hide vambraces", id: "30082", imgName: "Hueycoatl_hide_vambraces" }
    ],
    setId: "31169",
    setImgName: "Hueycoatl_hide_armour_set"
  },

  // Barrows Sets
  {
    name: "Ahrim's Armour Set",
    items: [
      { name: "Ahrim's hood", id: "4708", imgName: "Ahrim's_hood_detail" },
      { name: "Ahrim's robetop", id: "4712", imgName: "Ahrim's_robetop_detail" },
      { name: "Ahrim's robeskirt", id: "4714", imgName: "Ahrim's_robeskirt_detail" },
      { name: "Ahrim's staff", id: "4710", imgName: "Ahrim's_staff_detail" }
    ],
    setId: "12881",
    setImgName: "Ahrim's_armour_set_detail"
  },
  {
    name: "Dharok's Armour Set",
    items: [
      { name: "Dharok's helm", id: "4716", imgName: "Dharok's_helm_detail" },
      { name: "Dharok's platebody", id: "4720", imgName: "Dharok's_platebody" },
      { name: "Dharok's platelegs", id: "4722", imgName: "Dharok's_platelegs" },
      { name: "Dharok's greataxe", id: "4718", imgName: "Dharok's_greataxe" }
    ],
    setId: "12877",
    setImgName: "Dharok's_armour_set"
  },
  {
    name: "Guthan's Armour Set",
    items: [
      { name: "Guthan's helm", id: "4724", imgName: "Guthan's_helm" },
      { name: "Guthan's platebody", id: "4728", imgName: "Guthan's_platebody" },
      { name: "Guthan's chainskirt", id: "4730", imgName: "Guthan's_chainskirt" },
      { name: "Guthan's warspear", id: "4726", imgName: "Guthan's_warspear" }
    ],
    setId: "12873",
    setImgName: "Guthan's_armour_set"
  },
  {
    name: "Karil's Armour Set",
    items: [
      { name: "Karil's coif", id: "4732", imgName: "Karil's_coif" },
      { name: "Karil's leathertop", id: "4736", imgName: "Karil's_leathertop" },
      { name: "Karil's leatherskirt", id: "4738", imgName: "Karil's_leatherskirt" },
      { name: "Karil's crossbow", id: "4734", imgName: "Karil's_crossbow" }
    ],
    setId: "12883",
    setImgName: "Karil's_armour_set"
  },
  {
    name: "Torag's Armour Set",
    items: [
      { name: "Torag's helm", id: "4745", imgName: "Torag's_helm" },
      { name: "Torag's platebody", id: "4749", imgName: "Torag's_platebody" },
      { name: "Torag's platelegs", id: "4751", imgName: "Torag's_platelegs" },
      { name: "Torag's hammers", id: "4747", imgName: "Torag's_hammers" }
    ],
    setId: "12879",
    setImgName: "Torag's_armour_set"
  },
  {
    name: "Verac's Armour Set",
    items: [
      { name: "Verac's helm", id: "4753", imgName: "Verac's_helm" },
      { name: "Verac's brassard", id: "4757", imgName: "Verac's_brassard" },
      { name: "Verac's plateskirt", id: "4759", imgName: "Verac's_plateskirt" },
      { name: "Verac's flail", id: "4755", imgName: "Verac's_flail" }
    ],
    setId: "12875",
    setImgName: "Verac's_armour_set"
  }

  
];

