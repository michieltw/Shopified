// Mock data to simulate Shopify Metaobjects

const CONFIGURATOR_DATA = {
    basePrice: 200,
    options: [
        { id: "amount", name: "Stick(s) amount", type: "number", default: 1, min: 1 },
        { id: "hand", name: "Stick hand", type: "select", values: ["Left", "Right"], default: "Left" },
        { id: "type", name: "Stick type", type: "select", values: ["Goalie", "Player"], default: "Player" },
        { id: "category", name: "Stick category", type: "select", values: ["Senior", "Intermediate", "Junior", "Youth"], default: "Senior" },

        { id: "shaft", name: "Stick shaft", type: "select",
          values: ["Goalie", "Goalie Trigger", "Junior", "Youth", "Oval", "Square", "Penta", "Concave"],
          default: "Square" },

        { id: "flexProfile", name: "Stick flex-profile", type: "select",
          values: ["Ultra-low kick", "Low kick", "Mid-low kick", "Hybrid kick", "Tribrid kick", "Mid kick", "Elevated Mid kick", "High kick"],
          default: "Low kick" },

        { id: "flex", name: "Stick flex", type: "select",
          values: ["20-50", "50-65", "65-125"],
          default: "65-125" },

        { id: "bladecurve", name: "Stick bladecurve", type: "select",
          values: ["P02", "P08", "PM9", "P14", "P28", "P28 Max", "P31", "P77", "P86", "P88", "P90TM", "P91A", "P92", "P92 Max", "Full Custom"],
          default: "P92",
          surcharges: { "Full Custom": 30 }
        },

        { id: "shaftTexture", name: "Stick shaft texture", type: "select",
          values: ["Matte", "Matte + Tacky Grip", "Glossy", "Glossy + Tacky Grip", "Super Glossy + Tacky Grip"],
          default: "Matte + Tacky Grip" },

        { id: "shaft3dTexture", name: "Stick shaft 3D texture", type: "select",
          values: ["None", "Fishbone", "Straight", "Diagonal", "Fully Raised", "Candy Cane"],
          default: "None" },

        { id: "bladeTexture", name: "Stick blade texture", type: "select",
          values: ["Matte", "Glossy", "Sanded", "3D texture"],
          default: "Matte" },

        { id: "colorStyle", name: "Stick colorstyle", type: "select",
          values: ["No color (Blackout)", "Transparent", "Painted"],
          default: "No color (Blackout)" },

        { id: "bladeColor", name: "Stick blade color", type: "select",
          values: ["Matches Shaft", "Distinct"],
          default: "Matches Shaft" },

        { id: "weightClass", name: "Stick weight class", type: "select",
          values: ["Ultra lightweight", "Super lightweight", "Pro lightweight", "lightweight", "Welterweight"],
          default: "Pro lightweight",
          surcharges: { "Ultra lightweight": 50, "Super lightweight": 30 }
        },

        { id: "length", name: "Stick length", type: "select",
          values: ["Short", "Standard", "Extended"],
          default: "Standard",
          surcharges: { "Extended": 15 }
        },

        { id: "namebar", name: "Stick namebar + number", type: "text", default: "" },

        { id: "graphics", name: "Stick graphics", type: "select",
          values: ["No graphics (Blackout)", "Pick a design", "Custom design"],
          default: "No graphics (Blackout)",
          surcharges: { "Custom design": 40 }
        },

        { id: "mold", name: "Stick mold", type: "select",
          values: ["Premolded", "Custom mold", "Mystery mold", "Pro range", "Oilslick", "Select", "Cataphract", "Houwitzer T7", "Houwitzer T7K"],
          default: "Premolded",
          surcharges: { "Custom mold": 50 }
        }
    ],

    // Dependency Rules (If trigger is matched, limit target to allowedValues)
    dependencies: [
        { trigger: "type", value: "Goalie", target: "shaft", allowedValues: ["Goalie", "Goalie Trigger"] },
        { trigger: "type", value: "Player", target: "shaft", allowedValues: ["Junior", "Youth", "Oval", "Square", "Penta", "Concave"] },
        { trigger: "type", value: "Goalie", target: "bladecurve", allowedValues: ["P31", "Full Custom"] }, // Mock example
        { trigger: "category", value: "Senior", target: "flex", allowedValues: ["65-125"] },
        { trigger: "category", value: "Junior", target: "flex", allowedValues: ["20-50"] }
    ],

    // Image mapping (mock). Keys match option values.
    images: {
        baseShape: "assets/images (1).png",
        textures: {
            "Diagonal": "assets/Diagonal_LH_Full_Res__21518.png"
        }
    }
};

// Export for module usage or attach to window for simple mock
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIGURATOR_DATA };
} else {
    window.CONFIGURATOR_DATA = CONFIGURATOR_DATA;
}