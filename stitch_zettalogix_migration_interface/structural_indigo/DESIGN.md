# Design System Specification: The Architectural Ledger

## 1. Overview & Creative North Star
This design system is built on the principle of **"The Architectural Ledger."** In the high-stakes world of enterprise data migration, we do not simply move information; we relocate digital infrastructure. This system rejects the cluttered, "dashboard-lite" aesthetic of common SaaS tools in favor of an editorial, high-precision environment.

**The Creative North Star: Structured Weightlessness.**
We achieve this through intentional asymmetry, where technical data is balanced by generous, purposeful whitespace. By breaking the rigid "box-within-a-box" layout, we create a sense of monumental clarity. Every element is placed with the intent of a blueprinted schematic—authoritative, reliable, and premium.

---

## 2. Colors & Surface Logic
The palette is rooted in a "cool-neutral" foundation, utilizing the primary Indigo to denote action and intelligence.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through background color shifts or tonal transitions.
*   **Action:** To separate a sidebar from a main content area, use `surface-container-low` (#eff4ff) against the `surface` (#f8f9ff) background.
*   **Result:** A softer, more integrated UI that feels engineered rather than "pasted."

### Surface Hierarchy & Nesting
Treat the UI as physical layers. We use the `surface-container` tiers to define "elevation" without shadows:
1.  **Base Layer:** `surface` (#f8f9ff) – The primary canvas.
2.  **Navigation/Context Layers:** `surface-container-low` (#eff4ff) or `surface-container` (#e6eeff).
3.  **Active Workspace:** `surface-container-lowest` (#ffffff) – Reserved for the most critical data entry or focused reading, creating a "lit from within" effect.

### Glassmorphism & Signature Texture
For floating elements (modals, dropdowns, or sticky headers), use **Glassmorphism**. Apply a semi-transparent `surface` color with a 20px-30px `backdrop-blur`.
*   **The Signature Gradient:** While the brand is minimal, main CTAs should use a subtle, 5-degree linear gradient from `primary` (#544fc0) to `primary-dim` (#4742b3). This prevents the "flat-UI" fatigue and adds a tactile, high-end "soul" to interactive elements.

---

## 3. Typography
We utilize **Inter** as our sole typeface, relying on a sophisticated scale to create editorial rhythm.

*   **Display Scale (sm to lg):** Reserved for high-level migration status and "Hero" metrics. These should be set with tight letter-spacing (-0.02em) to look authoritative.
*   **Headline & Title Scale:** Used for section headers. Use `on-surface` (#00345e) to ensure deep, high-contrast readability.
*   **Body Scale (md to lg):** The workhorse for technical logs and metadata. Maintain a line height of 1.5x for `body-md` to ensure data density doesn't lead to eye fatigue.
*   **Label Scale:** Essential for technical "micro-copy." These should be used in `on-surface-variant` (#306197) to provide a clear secondary hierarchy.

---

## 4. Elevation & Depth
In this design system, depth is a function of light and layering, not structural lines.

### The Layering Principle
Depth is achieved by stacking. A `surface-container-lowest` card placed atop a `surface-container-low` background provides a soft, natural lift. This "Tonal Layering" is our primary method of organization.

### Ambient Shadows
When a component must float (e.g., a critical migration modal), use **Ambient Shadows**:
*   **Color:** Use the `on-surface` color (#00345e) at 6% opacity.
*   **Blur:** Extra-diffused (Blur: 32px, Spread: -4px).
*   **Philosophy:** Shadows should mimic natural light, appearing as a soft glow rather than a dark silhouette.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a high-density data grid), you must use a **Ghost Border**:
*   **Token:** `outline-variant` (#87b5f0) at 15% opacity.
*   **Constraint:** Never use 100% opaque, high-contrast borders.

---

## 5. Components

### Buttons
*   **Primary:** Indigo background (`primary`), `on-primary` text. 4px-8px corner radius (`md`).
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **Tertiary:** Transparent background. Use `primary` text. Highlight on hover with a `primary-container` tint at 20%.

### Input Fields
*   **Style:** Forgo the white box. Use `surface-container` (#e6eeff) as the field background.
*   **Focus State:** A "Ghost Border" using `primary` at 40% opacity and a 2px outer "glow" using the same color at 10%.

### Cards & Lists
*   **Anti-Pattern:** Forbid the use of divider lines.
*   **Pattern:** Separate list items using vertical whitespace (16px/24px) or a subtle background toggle between `surface` and `surface-container-lowest`.

### Migration Progress Bar (Custom Component)
*   A thick, 8px track using `surface-container-highest`.
*   The progress indicator uses the `primary` to `primary-dim` gradient.
*   Success states utilize `tertiary` (#575e78) rather than a jarring bright green to maintain the "serious" tone.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align primary content to a 12-column grid, but allow secondary metadata to sit in a wider, asymmetrical gutter to create an editorial feel.
*   **Use Tonal Shifts:** When in doubt, change the background color of a container instead of adding a stroke.
*   **Prioritize Breathing Room:** If a screen feels "enterprise-heavy," increase the padding by 1.5x the standard spacing scale.

### Don't:
*   **Don't use 100% Black:** Even for text. Use `on-surface` (#00345e) to keep the palette sophisticated and "ink-like."
*   **Don't use Standard Shadows:** Never use the default drop-shadow settings in your design tool. Always tint the shadow with the surface color.
*   **Don't use Row Dividers:** In data tables, use alternating background tints (`surface-container-low` and `surface`) to guide the eye horizontally.
