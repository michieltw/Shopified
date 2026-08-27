# AI Build Plan: Blackout Hockey Stick Configurator

## 1. Project Overview & Brand Identity
*   **Goal:** Build a dynamic, highly versatile, and modular hockey stick product configurator.
*   **Platform:** Shopify (Native implementation, no external paid apps).
*   **Theme Compatibility:** Horizon Theme.
*   **Brand Identity:** Blackout Hockey (www.blackouthockey.nl). The design must be premium, trustworthy, and minimalist (not too busy).
*   **Target Audience / Devices:** Strictly mobile-first, but fully functional and elegant on desktop.
*   **Core Visual Mechanic:** A dynamic visual engine using overlapping transparent PNGs that instantly update based on user selections. The amount of image layers and configuration options must be manageable via the Shopify Theme Editor and Metaobjects.

## 2. Data Architecture & Manageability (Shopify Metaobjects)
To achieve the requested "extreme ease of use" for the merchant to update options, pricing, and images, the app must rely heavily on **Shopify Metaobjects**.

*   **Metaobject: `Configurator_Option`**
    *   *Fields:* Option ID (Internal), Display Name, Group/Category, Option Values (JSON or List), Surcharges (e.g., Custom Mold +€20), Associated Image Assets.
*   **Metaobject: `Dependency_Rule` (Conditional Logic)**
    *   *Concept:* If `Stick Type = Goalie`, then `Stick Shaft` must only show `Goalie` and `Goalie Trigger`.
    *   *Fields:* Trigger Option, Trigger Value, Target Option, Allowed Values.
*   **Metaobject: `Visual_Layer`**
    *   *Concept:* Allows the merchant to dictate the order of PNG layers (e.g., 1. Base Shape, 2. Texture, 3. Paint, 4. Graphics).
    *   *Fields:* Layer Z-Index, Bound Option, Default Image.

## 3. Product Options & Features
The configurator must handle the following inputs. *Note: Not all options apply to every stick (managed by Dependency Rules).*

**User Configurable Options:**
1.  **Stick(s) amount:** (Quantity)
2.  **Stick hand:** Left, Right
3.  **Stick type:** Goalie, Player
4.  **Stick category:** Senior, Intermediate, Junior, Youth
5.  **Stick shaft:** Goalie, Goalie Trigger, Junior, Youth, Oval, Square, Penta, Concave
6.  **Stick flex-profile:** Ultra-low kick, Low kick, Mid-low kick, Hybrid kick, Tribrid kick, Mid kick, Elevated Mid kick, High kick
7.  **Stick flex:** 20-50, 50-65, 65-125
8.  **Stick bladecurve:** P02, P08, PM9, P14, P28, P28 Max, P31, P77, P86, P88, P90TM, P91A, P92, P92 Max, Full Custom
9.  **Stick shaft texture:** Matte, Matte + Tacky Grip, Glossy, Glossy + Tacky Grip, Super Glossy + Tacky Grip
10. **Stick shaft 3D texture:** None, Fishbone, Straight, Diagonal, Fully Raised, Candy Cane
11. **Stick blade texture:** Matte, Glossy, Sanded, 3D texture
12. **Stick colorstyle:** No color (Blackout), Transparent, Painted
13. **Stick blade color:** Matches Shaft, Distinct
14. **Stick weight class:** Ultra lightweight, Super lightweight, Pro lightweight, lightweight, Welterweight
15. **Stick length:** Short, Standard, Extended
16. **Stick namebar + number:** (Text inputs)
17. **Stick graphics:** No graphics (Blackout), Pick a design, Custom design
18. **Stick mold:** Premolded, Custom mold, Mystery mold, Pro range, Oilslick, Select, Cataphract, Houwitzer T7, Houwitzer T7K

**Non-Configurable Display Metrics (Read-only, updates based on choices):**
*   Stick performance indicators
*   Stick durability
*   Stick price estimate (Dynamically calculates Base Price + Option Surcharges)
*   Stick power / speed / accuracy / agility / durability / sensitivity (Radar chart or progress bars)
*   Stick material
*   Stick delivery time estimated

## 4. UX/UI & Application Flow

### A. The Guided Selling Page (Keuzehulp)
*   **Format:** A separate Shopify Page (`page.guided-selling.liquid`).
*   **Function:** A questionnaire (e.g., "What is your play style?", "What is your level?") that outputs a recommended stick configuration.
*   **Action:** A button that links to the Configurator page, passing the recommended options via URL parameters (`?build=BASE64CODE`).

### B. The Main Configurator Interface
*   **Layout:**
    *   *Mobile:* Sticky footer with Price and "Next" button. Top half is the visual stick representation. Bottom half is a scrollable area for option selection.
    *   *Desktop:* Split screen (Left: Fixed Visualizer, Right: Scrollable Options).
*   **Visualizer Engine:** Overlapping absolute-positioned `<img>` tags wrapped in a relative container. As options change, JavaScript updates the `src` of the respective layer.
*   **"Ask for Advice" Button:** Accessible at all times, opening a contact modal containing the current configuration.
*   **"Overview" Button:** A toggle/slide-out drawer showing a summary of all currently selected options.

### C. Post-Configuration / End of Flow
When the user finishes the configuration, they land on a **Summary Screen** featuring:
1.  **Unique Build Code:** The JS state object is serialized into JSON and Base64 encoded (e.g., `BKH-eyJ0eXBlIjoiZ29hbGll...`). The user can copy this code or URL to retrieve their build later.
2.  **PDF Report Download:** Use a client-side JS library (like `jsPDF` or `html2pdf.js`). The PDF includes a high-res render of their stick, selected options, and "trivia/facts" about their build based on their choices.
3.  **Checkout Actions:**
    *   **Direct Checkout:** Uses Shopify's AJAX Cart API. The build options and Unique Build Code are injected as "Line Item Properties".
    *   **Send Request (Quote):** Submits the build as a Draft Order via the Shopify Storefront API / contact form to the merchant for custom invoicing.

## 5. Technical Implementation Steps for AI/Developer

*   **Step 1: Shopify Backend Setup**
    *   Create Metaobject definitions for `Options`, `Dependencies`, and `Visual_Layers`.
    *   Add placeholder entries to test logic.
*   **Step 2: Theme Scaffold (`custom-configurator.liquid`)**
    *   Create a new Section in the Horizon theme.
    *   Expose Theme Settings for Configurator Width, Brand Colors, and default images.
*   **Step 3: State Management (JavaScript)**
    *   Write a Vanilla JS class (`ConfiguratorState`) to hold the current selections, calculate pricing, and evaluate Dependency Rules.
*   **Step 4: Visual Engine**
    *   Implement the dynamic layer stacking using HTML/CSS. Ensure it scales perfectly on mobile and desktop.
*   **Step 5: UI Components**
    *   Build the minimalist option selectors (buttons, dropdowns, color swatches).
    *   Build the non-configurable metrics panel (radar charts/bars).
*   **Step 6: Build Code & URL Parsing**
    *   Implement Base64 encoding/decoding functions to generate the Unique Build Code and parse it from `window.location.search`.
*   **Step 7: PDF Generation**
    *   Import `html2pdf.js` (or similar). Design a hidden HTML template for the PDF layout, populate it with state data, and trigger download on button click.
*   **Step 8: Cart & Form Integration**
    *   Write the AJAX POST request to `/cart/add.js` mapping the state to line item properties.
    *   Implement the "Send Request" form logic.
*   **Step 9: Guided Selling Module**
    *   Build the separate quiz page template and the logic to generate the redirect URL with the build code.

## 6. Code Style & AI Directives
*   **Language:** Write all comments, documentation, and error messages in English.
*   **Modularity:** Keep JavaScript functions small and pure where possible. Separate UI rendering from State Management.
*   **Performance:** Preload image layers (PNGs) in the background to prevent flickering when users click options.
*   **Styling:** Use standard CSS or Tailwind (if already in the theme). Match Horizon's typography and spacing variables.
