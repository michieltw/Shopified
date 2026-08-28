(function () {
  /**
   * Blackout Hockey Configurator
   * Shopify Native JavaScript Logic
   */

  // Hardcoded for demo/setup - in a real Shopify app,
  // this would be printed out by Liquid from Metaobjects in the .liquid section
  const CONFIGURATOR_DATA = {
    options: [
      {
        id: "amount",
        name: "Stick(s) amount",
        type: "number",
        default: 1,
        min: 1,
      },
      {
        id: "hand",
        name: "Stick hand",
        type: "select",
        options: ["Left", "Right"],
        default: "Left",
      },
      {
        id: "type",
        name: "Stick type",
        type: "select",
        options: ["Goalie", "Player"],
        default: "Player",
      },
      {
        id: "category",
        name: "Stick category",
        type: "select",
        options: ["Senior", "Intermediate", "Junior", "Youth"],
        default: "Senior",
      },
      {
        id: "shaft",
        name: "Stick shaft",
        type: "select",
        options: [
          "Goalie",
          "Goalie Trigger",
          "Junior",
          "Youth",
          "Oval",
          "Square",
          "Penta",
          "Concave",
        ],
        default: "Square",
      },
      {
        id: "flexProfile",
        name: "Stick flex-profile",
        type: "select",
        options: [
          "Ultra-low kick",
          "Low kick",
          "Mid-low kick",
          "Hybrid kick",
          "Tribrid kick",
          "Mid kick",
          "Elevated Mid kick",
          "High kick",
        ],
        default: "Low kick",
      },
      {
        id: "flex",
        name: "Stick flex",
        type: "select",
        options: ["20-50", "50-65", "65-125"],
        default: "65-125",
      },
      {
        id: "bladecurve",
        name: "Stick bladecurve",
        type: "select",
        options: [
          "P02",
          "P08",
          "PM9",
          "P14",
          "P28",
          "P28 Max",
          "P31",
          "P77",
          "P86",
          "P88",
          "P90TM",
          "P91A",
          "P92",
          "P92 Max",
          "Full Custom (+€30)",
        ],
        default: "P92",
        surcharges: { "Full Custom (+€30)": 30 },
      },
      {
        id: "shaftTexture",
        name: "Stick shaft texture",
        type: "select",
        options: [
          "Matte",
          "Matte + Tacky Grip",
          "Glossy",
          "Glossy + Tacky Grip",
          "Super Glossy + Tacky Grip",
        ],
        default: "Matte + Tacky Grip",
      },
      {
        id: "shaft3d",
        name: "Stick shaft 3D texture",
        type: "select",
        options: [
          "None",
          "Fishbone",
          "Straight",
          "Diagonal",
          "Fully Raised",
          "Candy Cane",
        ],
        default: "None",
      },
      {
        id: "bladeTexture",
        name: "Stick blade texture",
        type: "select",
        options: ["Matte", "Glossy", "Sanded", "3D texture"],
        default: "Matte",
      },
      {
        id: "colorstyle",
        name: "Stick colorstyle",
        type: "select",
        options: ["No color (Blackout)", "Transparent", "Painted"],
        default: "No color (Blackout)",
      },
      {
        id: "bladeColor",
        name: "Stick blade color",
        type: "select",
        options: ["Matches Shaft", "Distinct"],
        default: "Matches Shaft",
      },
      {
        id: "weight",
        name: "Stick weight class",
        type: "select",
        options: [
          "Ultra lightweight (+€50)",
          "Super lightweight (+€30)",
          "Pro lightweight",
          "lightweight",
          "Welterweight",
        ],
        default: "Pro lightweight",
        surcharges: {
          "Ultra lightweight (+€50)": 50,
          "Super lightweight (+€30)": 30,
        },
      },
      {
        id: "length",
        name: "Stick length",
        type: "select",
        options: ["Short", "Standard", "Extended (+€15)"],
        default: "Standard",
        surcharges: { "Extended (+€15)": 15 },
      },
      {
        id: "namebar",
        name: "Stick namebar + number",
        type: "text",
        default: "",
      },
      {
        id: "graphics",
        name: "Stick graphics",
        type: "select",
        options: ["No graphics (Blackout)", "Pick a design", "Custom design"],
        default: "No graphics (Blackout)",
      },
      {
        id: "mold",
        name: "Stick mold",
        type: "select",
        options: [
          "Premolded",
          "Custom mold",
          "Mystery mold",
          "Pro range",
          "Oilslick",
          "Select",
          "Cataphract",
          "Houwitzer T7",
          "Houwitzer T7K",
        ],
        default: "Premolded",
      },
    ],
  };

  class ConfiguratorState {
    constructor() {
      this.basePrice = 200; // In Shopify, grab from section settings or product object
      this.state = {};

      // Initialize default state
      CONFIGURATOR_DATA.options.forEach((opt) => {
        this.state[opt.id] = opt.default;
      });

      // Hydrate from URL if build code exists
      this.initFromUrl();
    }

    initFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const buildCode = params.get("build");
      if (buildCode) {
        try {
          // Ensure safe unicode decoding
          const decodedState = JSON.parse(
            decodeURIComponent(escape(atob(buildCode))),
          );
          this.state = { ...this.state, ...decodedState };
        } catch (e) {
          console.error("Invalid build code in URL");
        }
      }
    }

    getBuildCode() {
      return btoa(unescape(encodeURIComponent(JSON.stringify(this.state))));
    }

    setValue(optionId, value) {
      this.state[optionId] = value;
    }

    calculateTotal() {
      let total = this.basePrice;

      // Add quantity multiplier
      const qty = parseInt(this.state.amount) || 1;
      total = total * qty;

      // Add surcharges based on specific rules (handled via metaobjects ideally)
      CONFIGURATOR_DATA.options.forEach((opt) => {
        if (opt.surcharges && this.state[opt.id]) {
          const val = this.state[opt.id];
          if (opt.surcharges[val]) {
            total += opt.surcharges[val] * qty;
          }
        }
      });

      return total;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Check if we are on the configurator section
    const container = document.getElementById("options-container");
    if (!container) return;

    const state = new ConfiguratorState();

    // UI Elements
    const priceDisplay = document.getElementById("total-price");
    const dynamicLayers = document.getElementById("dynamic-layers");

    function renderOptions() {
      container.innerHTML = ""; // Clear

      CONFIGURATOR_DATA.options.forEach((opt) => {
        const group = document.createElement("div");
        group.className = "option-group";

        const title = document.createElement("h3");
        title.className = "option-group-title";
        title.textContent = opt.name;
        group.appendChild(title);

        if (opt.type === "number") {
          const input = document.createElement("input");
          input.type = "number";
          input.min = opt.min;
          input.value = state.state[opt.id];
          input.className = "input-number";
          input.addEventListener("change", (e) => {
            state.setValue(opt.id, parseInt(e.target.value));
            updateUI();
          });
          group.appendChild(input);
        } else if (opt.type === "text") {
          const input = document.createElement("input");
          input.type = "text";
          input.value = state.state[opt.id];
          input.placeholder = "e.g. SMITH 99";
          input.className = "input-text";
          // Safe 'change' listener instead of 'input' to preserve focus
          input.addEventListener("change", (e) => {
            state.setValue(opt.id, e.target.value);
            updateUI();
          });
          group.appendChild(input);
        } else if (opt.type === "select") {
          const btnGrid = document.createElement("div");
          btnGrid.className = "btn-grid";

          opt.options.forEach((val) => {
            const btn = document.createElement("button");
            btn.className = `btn-option ${state.state[opt.id] === val ? "selected" : ""}`;
            btn.textContent = val;
            btn.addEventListener("click", () => {
              state.setValue(opt.id, val);
              renderOptions(); // Re-render to update selected classes
              updateUI();
            });
            btnGrid.appendChild(btn);
          });
          group.appendChild(btnGrid);
        }

        container.appendChild(group);
      });
    }

    function updateVisualizer() {
      // In a real Shopify implementation, you would map state values to
      // specific image asset URLs defined in Metaobjects.
      // For the mock, we just clear and simulate it.
      dynamicLayers.innerHTML = "";

      // Example: If color is painted, add a painted layer
      if (state.state.colorstyle === "Painted") {
        // const img = document.createElement('img');
        // img.src = "{{ 'stick-painted-layer.png' | asset_url }}"; // Liquid not accessible here directly, pass via data attributes
        // dynamicLayers.appendChild(img);
      }
    }

    // Basic currency formatter since Shopify.formatMoney might not be available
    function formatMoney(cents) {
      if (typeof cents === "string") {
        cents = cents.replace(".", "");
      }
      const value = (cents / 100).toFixed(2);
      return value;
    }

    function updateUI() {
      // Update Price
      if (priceDisplay) {
        const price = state.calculateTotal();
        // Assuming basePrice is in dollars/euros, multiply by 100 to simulate cents if needed,
        // but since calculateTotal returns integer/float, we can format it directly.
        // Let's use formatMoney by passing cents format.
        priceDisplay.textContent = formatMoney(price * 100);
      }

      updateVisualizer();

      // Dynamic Stats
      let pwr = 85, spd = 92, acc = 90, agi = 88, dur = 95, sen = 80;
      if (state.state.flexProfile === "High kick") pwr += 5;
      if (state.state.flexProfile === "Ultra-low kick") spd += 5;
      if (state.state.weight === "Ultra lightweight (+€50)") {
        pwr -= 5;
        dur -= 10;
        sen += 5;
      }

      const statPower = document.getElementById("stat-power");
      const statSpeed = document.getElementById("stat-speed");
      const statAccuracy = document.getElementById("stat-accuracy");
      const statAgility = document.getElementById("stat-agility");
      const statDurability = document.getElementById("stat-durability");
      const statSensitivity = document.getElementById("stat-sensitivity");

      if (statPower) statPower.style.width = pwr + "%";
      if (statSpeed) statSpeed.style.width = spd + "%";
      if (statAccuracy) statAccuracy.style.width = acc + "%";
      if (statAgility) statAgility.style.width = agi + "%";
      if (statDurability) statDurability.style.width = dur + "%";
      if (statSensitivity) statSensitivity.style.width = sen + "%";

      // Delivery Estimate
      const deliveryEstimate = document.getElementById("delivery-estimate");
      if (deliveryEstimate) {
        if (state.state.bladecurve === "Full Custom (+€30)" || state.state.mold === "Custom mold") {
          deliveryEstimate.textContent = "6-8 Weeks";
          deliveryEstimate.classList.add("text-highlight");
        } else {
          deliveryEstimate.textContent = "4-6 Weeks";
          deliveryEstimate.classList.remove("text-highlight");
        }
      }

      // Update URL safely with history API without reloading
      const url = new URL(window.location);
      url.searchParams.set("build", state.getBuildCode());
      window.history.replaceState({}, "", url);
    }

    // Modal Logic
    const btnOverview = document.getElementById("btn-overview");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const modal = document.getElementById("overview-modal");
    const buildCodeDisplay = document.getElementById("build-code-display");
    const summaryList = document.getElementById("summary-list");

    if (btnOverview) {
      btnOverview.addEventListener("click", () => {
        buildCodeDisplay.textContent = state.getBuildCode();

        summaryList.innerHTML = ""; // clear
        CONFIGURATOR_DATA.options.forEach((opt) => {
          const li = document.createElement("li");

          const label = document.createElement("span");
          label.className = "label";
          label.textContent = opt.name + ": ";

          const val = document.createElement("span");
          val.textContent = state.state[opt.id];

          li.appendChild(label);
          li.appendChild(val);
          summaryList.appendChild(li);
        });

        modal.classList.remove("hidden");
      });
    }

    if (btnCloseModal) {
      btnCloseModal.addEventListener("click", () =>
        modal.classList.add("hidden"),
      );
    }

    // PDF Export Logic
    const btnPdf = document.getElementById("btn-pdf");
    if (btnPdf) {
      btnPdf.addEventListener("click", () => {
        // Ensure summary list is populated before cloning
        buildCodeDisplay.textContent = state.getBuildCode();
        summaryList.innerHTML = "";
        CONFIGURATOR_DATA.options.forEach((opt) => {
          const li = document.createElement("li");
          const label = document.createElement("span");
          label.className = "label";
          label.textContent = opt.name + ": ";
          const val = document.createElement("span");
          val.textContent = state.state[opt.id];
          li.appendChild(label);
          li.appendChild(val);
          summaryList.appendChild(li);
        });

        // Select the modal content to export
        const contentToExport = document.querySelector(".modal-content");
        if (contentToExport && window.html2pdf) {
          const clone = contentToExport.cloneNode(true);
          // Apply minimal styling for a clean PDF if needed
          clone.style.padding = "20px";
          clone.style.color = "#000";
          clone.style.backgroundColor = "#fff";

          // Use html2pdf to generate
          html2pdf().from(clone).save('blackout-hockey-build.pdf');
        }
      });
    }

    // Share Link Logic
    const btnShare = document.getElementById("btn-share");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const originalText = btnShare.textContent;
          btnShare.textContent = "Copied!";
          setTimeout(() => {
            btnShare.textContent = originalText;
          }, 2000);
        }).catch(err => console.error("Could not copy link:", err));
      });
    }

    // Checkout Logic (Shopify AJAX Cart integration placeholder)
    const btnCheckout = document.getElementById("btn-checkout");
    if (btnCheckout) {
      btnCheckout.addEventListener("click", () => {
        const configuratorDiv = document.querySelector(
          ".blackout-configurator",
        );
        const variantId = configuratorDiv
          ? configuratorDiv.dataset.variantId
          : null;

        if (!variantId) {
          alert("Please select a base product configuration first.");
          return;
        }

        // Gather all line item properties from `state.state`
        const properties = {
          _build_code: state.getBuildCode(),
        };

        // Add all options as properties for the cart
        for (const [key, value] of Object.entries(state.state)) {
          if (key !== "amount") {
            // amount is handled as quantity
            properties[key] = value;
          }
        }

        const payload = {
          items: [
            {
              id: variantId,
              quantity: parseInt(state.state.amount) || 1,
              properties: properties,
            },
          ],
        };

        fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            if (response.ok) {
              window.location.href = "/cart";
            } else {
              return response.json().then((data) => {
                alert(
                  "Error adding to cart: " + (data.description || data.message),
                );
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
          });
      });
    }

    // Initial render
    renderOptions();
    updateUI();
  });
})();
