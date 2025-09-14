// --- Armor Sets ---
const armorSetsData = [
  // Sunfire & Moon Sets
  {
    name: "Sunfire Fanatic",
    items: [
      { name: "Helm", id: "28933", imgName: "Sunfire_fanatic_helm" },
      { name: "Cuirass", id: "28936", imgName: "Sunfire_fanatic_cuirass" },
      { name: "Chausses", id: "28939", imgName: "Sunfire_fanatic_chausses" }
    ],
    setId: "29424",
    setImgName: "Sunfire_fanatic_armour_set"
  },
  {
    name: "Blood Moon",
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
    name: "Blue Moon",
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
    name: "Eclipse Moon",
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
      { name: "Inquisitor's great helm", id: "24419", imgName: "Inquisitor_great_helm" },
      { name: "Inquisitor's hauberk", id: "24420", imgName: "Inquisitor_hauberk" },
      { name: "Inquisitor's plateskirt", id: "24421", imgName: "Inquisitor_plateskirt" },
      { name: "Inquisitor's mace", id: "24417", imgName: "Inquisitor_mace" }
    ],
    setId: "24488",
    setImgName: "Inquisitor_armour_set"
  },

  // Dagon'hai Robes Set
  {
    name: "Dagon'hai Robes Set",
    items: [
      { name: "Dagon'hai hat", id: "24288", imgName: "Dagonhai_hat" },
      { name: "Dagon'hai robe top", id: "24291", imgName: "Dagonhai_robe_top" },
      { name: "Dagon'hai robe bottom", id: "24294", imgName: "Dagonhai_robe_bottom" }
    ],
    setId: "24333",
    setImgName: "Dagonhai_robes_set"
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
      { name: "Masori mask (f)", id: "27235", imgName: "Masori_mask_f" },
      { name: "Masori body (f)", id: "27238", imgName: "Masori_body_f" },
      { name: "Masori chaps (f)", id: "27241", imgName: "Masori_chaps_f" }
    ],
    setId: "27355",
    setImgName: "Masori_armour_set_f"
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
      { name: "Ahrim's hood", id: "4708", imgName: "Ahrim_the_Blighted_hood" },
      { name: "Ahrim's robetop", id: "4712", imgName: "Ahrim_the_Blighted_robetop" },
      { name: "Ahrim's robeskirt", id: "4714", imgName: "Ahrim_the_Blighted_robeskirt" },
      { name: "Ahrim's staff", id: "4710", imgName: "Ahrim_the_Blighted_staff" }
    ],
    setId: "12881",
    setImgName: "Ahrim_the_Blighted_set"
  },
  {
    name: "Dharok's Armour Set",
    items: [
      { name: "Dharok's helm", id: "4716", imgName: "Dharok_the_Wretched_helm" },
      { name: "Dharok's platebody", id: "4720", imgName: "Dharok_the_Wretched_platebody" },
      { name: "Dharok's platelegs", id: "4722", imgName: "Dharok_the_Wretched_platelegs" },
      { name: "Dharok's greataxe", id: "4718", imgName: "Dharok_the_Wretched_greataxe" }
    ],
    setId: "12877",
    setImgName: "Dharok_the_Wretched_set"
  },
  {
    name: "Guthan's Armour Set",
    items: [
      { name: "Guthan's helm", id: "4724", imgName: "Guthan_the_Infested_helm" },
      { name: "Guthan's platebody", id: "4728", imgName: "Guthan_the_Infested_platebody" },
      { name: "Guthan's chainskirt", id: "4730", imgName: "Guthan_the_Infested_chainskirt" },
      { name: "Guthan's warspear", id: "4726", imgName: "Guthan_the_Infested_warspear" }
    ],
    setId: "12873",
    setImgName: "Guthan_the_Infested_set"
  },
  {
    name: "Karil's Armour Set",
    items: [
      { name: "Karil's coif", id: "4732", imgName: "Karil_the_Tainted_coif" },
      { name: "Karil's leathertop", id: "4736", imgName: "Karil_the_Tainted_leathertop" },
      { name: "Karil's leatherskirt", id: "4738", imgName: "Karil_the_Tainted_leatherskirt" },
      { name: "Karil's crossbow", id: "4734", imgName: "Karil_the_Tainted_crossbow" }
    ],
    setId: "12883",
    setImgName: "Karil_the_Tainted_set"
  },
  {
    name: "Torag's Armour Set",
    items: [
      { name: "Torag's helm", id: "4745", imgName: "Torag_the_Corrupted_helm" },
      { name: "Torag's platebody", id: "4749", imgName: "Torag_the_Corrupted_platebody" },
      { name: "Torag's platelegs", id: "4751", imgName: "Torag_the_Corrupted_platelegs" },
      { name: "Torag's hammers", id: "4747", imgName: "Torag_the_Corrupted_hammers" }
    ],
    setId: "12879",
    setImgName: "Torag_the_Corrupted_set"
  },
  {
    name: "Verac's Armour Set",
    items: [
      { name: "Verac's helm", id: "4753", imgName: "Verac_the_Defiled_helm" },
      { name: "Verac's brassard", id: "4757", imgName: "Verac_the_Defiled_brassard" },
      { name: "Verac's plateskirt", id: "4759", imgName: "Verac_the_Defiled_plateskirt" },
      { name: "Verac's flail", id: "4755", imgName: "Verac_the_Defiled_flail" }
    ],
    setId: "12875",
    setImgName: "Verac_the_Defiled_set"
  }
];

// --- Potion Data ---

const potionData = [
  { name: "Agility potion", id1: "3038", id2: "3036", id3: "3034", id4: "3032", imgName: "Agility_potion" },
  { name: "Antifire potion", id1: "2458", id2: "2456", id3: "2454", id4: "2452", imgName: "Antifire_potion" },
  { name: "Attack potion", id1: "125", id2: "123", id3: "121", id4: "2428", imgName: "Attack_potion" },
  { name: "Bastion potion", id1: "22470", id2: "22467", id3: "22464", id4: "22461", imgName: "Bastion_potion" },
  { name: "Battlemage potion", id1: "22458", id2: "22455", id3: "22452", id4: "22449", imgName: "Battlemage_potion" },
  { name: "Combat potion", id1: "9745", id2: "9743", id3: "9741", id4: "9739", imgName: "Combat_potion" },
  { name: "Compost potion", id1: "6476", id2: "6474", id3: "6472", id4: "6470", imgName: "Compost_potion" },
  { name: "Defence potion", id1: "137", id2: "135", id3: "133", id4: "2432", imgName: "Defence_potion" },
  { name: "Divine bastion potion", id1: "24644", id2: "24641", id3: "24638", id4: "24635", imgName: "Divine_bastion_potion" },
  { name: "Divine battlemage potion", id1: "24632", id2: "24629", id3: "24626", id4: "24623", imgName: "Divine_battlemage_potion" },
  { name: "Divine magic potion", id1: "23754", id2: "23751", id3: "23748", id4: "23745", imgName: "Divine_magic_potion" },
  { name: "Divine ranging potion", id1: "23742", id2: "23739", id3: "23736", id4: "23733", imgName: "Divine_ranging_potion" },
  { name: "Divine super attack potion", id1: "23706", id2: "23703", id3: "23700", id4: "23697", imgName: "Divine_super_attack_potion" },
  { name: "Divine super combat potion", id1: "23694", id2: "23691", id3: "23688", id4: "23685", imgName: "Divine_super_combat_potion" },
  { name: "Divine super defence potion", id1: "23730", id2: "23727", id3: "23724", id4: "23721", imgName: "Divine_super_defence_potion" },
  { name: "Divine super strength potion", id1: "23718", id2: "23715", id3: "23712", id4: "23709", imgName: "Divine_super_strength_potion" },
  { name: "Energy potion", id1: "3014", id2: "3012", id3: "3010", id4: "3008", imgName: "Energy_potion" },
  { name: "Fishing potion", id1: "155", id2: "153", id3: "151", id4: "2438", imgName: "Fishing_potion" },
  { name: "Goading potion", id1: "30146", id2: "30143", id3: "30140", id4: "30137", imgName: "Goading_potion" },
  { name: "Hunter potion", id1: "10004", id2: "10002", id3: "10000", id4: "9998", imgName: "Hunter_potion" },
  { name: "Magic potion", id1: "3046", id2: "3044", id3: "3042", id4: "3040", imgName: "Magic_potion" },
  { name: "Prayer potion", id1: "143", id2: "141", id3: "139", id4: "2434", imgName: "Prayer_potion" },
  { name: "Prayer regeneration potion", id1: "30134", id2: "30131", id3: "30128", id4: "30125", imgName: "Prayer_regeneration_potion" },
  { name: "Ranging potion", id1: "173", id2: "171", id3: "169", id4: "2444", imgName: "Ranging_potion" },
  { name: "Restore potion", id1: "131", id2: "129", id3: "127", id4: "2430", imgName: "Restore_potion" },
  { name: "Stamina potion", id1: "12631", id2: "12629", id3: "12627", id4: "12625", imgName: "Stamina_potion" },
  { name: "Strength potion", id1: "119", id2: "117", id3: "115", id4: "113", imgName: "Strength_potion" },
  { name: "Super antifire potion", id1: "21987", id2: "21984", id3: "21981", id4: "21978", imgName: "Super_antifire_potion" },
  { name: "Super combat potion", id1: "12701", id2: "12699", id3: "12697", id4: "12695", imgName: "Super_combat_potion" },
];
