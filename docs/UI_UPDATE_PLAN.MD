# GoalGuard UI Update Plan - From Web Design to React Native

## 1. Introduction

This document outlines the plan to update the GoalGuard React Native application's UI based on a new design provided as a web project (HTML, Vite, Tailwind CSS). Due to the fundamental differences between web and React Native technologies, this process will involve re-implementing the visual design and layout using React Native components and styling, rather than a direct code migration.

The web UI project (cloned into `new_ui_temp`) will serve as the primary visual and structural reference.

## 2. Overall Strategy

The core strategy is to:

1.  **Analyze Each Screen/Component:** Review each screen and major component in the `new_ui_temp` web project to understand its layout, styling, and user interactions.
2.  **Re-implement in React Native:** Recreate these screens and components within the existing GoalGuard React Native project (`GoalGuard/` directory).
    - Utilize `React Native Paper` components where appropriate, and supplement with core `react-native` components (`View`, `Text`, `Image`, `TouchableOpacity`, etc.).
    - Translate Tailwind CSS utility classes into React Native styles (either inline styles, StyleSheet objects, or potentially a React Native utility-first styling library if desired for closer parity).
3.  **Integrate Existing Logic:** Connect the newly styled components to the existing application logic, state management (Contexts), API calls, and Supabase integrations.
4.  **Iterative Approach:** Update the UI screen by screen or feature by feature to manage complexity and allow for incremental testing.

## 3. Pre-requisites & Setup

- **Familiarize with New UI:** Thoroughly explore the `new_ui_temp` project running locally (if possible) to get a feel for the intended user experience.
- **Identify Core Styles:** Note recurring colors, typography, spacing, and layout patterns in the new UI. Consider creating a theme or global style constants in `GoalGuard/src/constants/theme.ts` or extending the React Native Paper theme.
- **Asset Extraction:** Extract any necessary image assets (icons, illustrations) from the `new_ui_temp/public/` or `new_ui_temp/src/assets/` directories and place them into `GoalGuard/assets/`. Ensure they are optimized for mobile.

## 4. Detailed Step-by-Step Plan

This plan will proceed on a screen-by-screen basis, starting with authentication and moving through the main application features.

### Step 4.1: Authentication Screens (Sign In, Sign Up)

- **Current Location:** `GoalGuard/app/(auth)/`
- **Reference:** Analyze the login/registration pages in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Auth Screens:**
    - Identify input field styles (text input, password input).
    - Note button styles (primary, secondary, social login if any).
    - Observe layout, branding (logo placement), and any helper text or links (e.g., "Forgot Password?", "Create Account").
2.  **Update `sign-in.tsx` (`GoalGuard/app/(auth)/sign-in.tsx`):**
    - Modify the existing React Native Paper components (or replace them) to match the new design.
    - Adjust layout (`View` components with Flexbox) to mirror the structure from the web reference.
    - Apply new styles for text inputs, buttons, and overall screen background/container.
    - Ensure all existing Supabase Auth logic remains functional.
3.  **Update `sign-up.tsx` (`GoalGuard/app/(auth)/sign-up.tsx`):**
    - Repeat the process from `sign-in.tsx`, applying the new design to the registration screen.
    - Ensure consistency in styling between sign-in and sign-up.
4.  **Review `_layout.tsx` in `(auth)` (`GoalGuard/app/(auth)/_layout.tsx`):**
    - Ensure any layout or navigation elements defined here are compatible with the new screen designs.

### Step 4.2: Main Tab Navigator & Root Layout

- **Current Location:** `GoalGuard/app/(tabs)/_layout.tsx` and `GoalGuard/app/_layout.tsx`
- **Reference:** General application shell, navigation patterns in `new_ui_temp`.

1.  **Analyze Navigation Structure:**
    - Does the new UI imply a different navigation structure (e.g., different tab icons, a drawer navigator instead of tabs)?
    - For now, assume the tab structure remains, but tab icons and styling will be updated.
2.  **Update Tab Bar Styling (`GoalGuard/app/(tabs)/_layout.tsx`):**
    - Customize the `Tabs` component from Expo Router.
    - Update tab icons to match the new design (extract/recreate if necessary).
    - Adjust tab bar background color, active/inactive tab styles.
3.  **Update Root Layout (`GoalGuard/app/_layout.tsx`):**
    - Ensure global styles or context providers in the root layout do not conflict with the new UI.
    - Update any global app chrome (e.g., header bar if not part of individual screens) if the new design dictates a different approach.

### Step 4.3: Dashboard Screen

- **Current Location:** `GoalGuard/app/(tabs)/dashboard.tsx`
- **Reference:** The main dashboard/home screen in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Dashboard:**
    - Break down the dashboard into key visual blocks (e.g., goal progress display, streak counter, coin balance, quick actions).
    - Note the layout, typography, use of cards, icons, and any data visualizations (e.g., progress bars).
2.  **Re-implement Dashboard Components:**
    - Create or update React Native components in `GoalGuard/src/components/` (e.g., `gamification/`, `goals/`) to represent these blocks.
    - Example: A `GoalProgressCard` component, a `StreakDisplay` component.
3.  **Update `dashboard.tsx`:**
    - Recompose the dashboard screen using the new/updated components.
    - Apply Flexbox and styling to achieve the target layout.
    - Ensure all data bindings (from HealthKit, UserProfileContext) are correctly wired to the new UI elements.
    - Pay attention to how progress is visually represented (e.g., circular progress, bar chart) and implement the React Native equivalent.

### Step 4.4: Goal Setting Screen

- **Current Location:** `GoalGuard/app/(tabs)/goals.tsx`
- **Reference:** Goal setting/management interface in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Goal Setting:**
    - How are goal types selected (e.g., steps, distance)?
    - How is the target value inputted?
    - How are apps selected for blocking (if visually represented in the new UI)?
    - Note the style of input elements, pickers, and confirmation buttons.
2.  **Update `goals.tsx`:**
    - Adapt the UI for goal type selection, target input, and app selection (if applicable) to the new design.
    - Use React Native Paper components like `TextInput`, `RadioButton`, `Checkbox`, or custom-styled pickers.
    - Ensure the form submission logic (`goalsApi.ts`) remains connected.

### Step 4.5: Progress Screen

- **Current Location:** `GoalGuard/app/(tabs)/progress.tsx`
- **Reference:** Detailed progress views or charts in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Progress Display:**
    - Does it show historical data, charts, or detailed breakdowns?
    - How is this information presented visually?
2.  **Update `progress.tsx`:**
    - Re-implement the progress display using React Native components.
    - If charts are used in the new design, consider using a React Native charting library (e.g., `react-native-svg-charts`, `victory-native`) or build simple visual representations.
    - Ensure data fetching and display logic is correctly integrated.

### Step 4.6: Rewards Store Screen

- **Current Location:** `GoalGuard/app/(tabs)/rewards-store.tsx`
- **Reference:** The shop/store interface in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Rewards Store:**
    - How are rewards listed (e.g., cards, list items)?
    - What information is displayed for each reward (name, price, icon, description)?
    - How does the purchase interaction work?
2.  **Update Rewards Components:**
    - Create/update components in `GoalGuard/src/components/gamification/` or `GoalGuard/src/components/common/` for displaying reward items.
3.  **Update `rewards-store.tsx`:**
    - Re-style the rewards listing.
    - Ensure purchase buttons and coin balance display are updated and functional.
    - Connect to existing logic for fetching rewards and processing purchases.

### Step 4.7: Inventory Screen

- **Current Location:** `GoalGuard/app/(tabs)/inventory.tsx`
- **Reference:** User inventory display in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Inventory:**
    - How are owned rewards displayed?
    - Is there an option to use/activate rewards from this screen?
2.  **Update Inventory Components:**
    - Create/update components in `GoalGuard/src/components/inventory/` for displaying owned items.
3.  **Update `inventory.tsx`:**
    - Re-style the inventory list.
    - Ensure logic for displaying quantities and using items (e.g., "Skip Day") is connected to the new UI.

### Step 4.8: Profile Screen

- **Current Location:** `GoalGuard/app/(tabs)/profile.tsx`
- **Reference:** User profile/settings page in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Profile Screen:**
    - What user information is displayed (username, email, stats)?
    - Are there options for editing profile, logging out, accessing settings?
2.  **Update `profile.tsx`:**
    - Re-style the profile screen elements.
    - Ensure all interactive elements (logout button, links to settings) are updated and functional.

### Step 4.9: Modal Screens (e.g., Screen Time Setup)

- **Current Location:** `GoalGuard/app/modal/screen-time-setup.tsx`
- **Reference:** Any modal dialogs or instructional overlays in `new_ui_temp`.

1.  **Analyze `new_ui_temp` Modals:**
    - Note the styling of modals (background, borders, buttons).
2.  **Update `screen-time-setup.tsx` (and any other modals):**
    - Restyle the modal content and container.
    - Ensure consistency with the overall new UI theme.

### Step 4.10: Reusable Components

- **Current Location:** `GoalGuard/src/components/`
- **Reference:** Common UI elements (buttons, cards, inputs) in `new_ui_temp`.

1.  **Identify Common Patterns:** As you work through the screens, identify common UI elements in the `new_ui_temp` design.
2.  **Create/Update Generic Components:**
    - Update existing components in `GoalGuard/src/components/common/` or create new ones to match the new design.
    - Examples: `StyledButton`, `StyledCard`, `StyledTextInput`.
    - This will promote consistency and reduce code duplication.
    - Ensure these components are flexible and customizable via props.

## 5. Styling Approach

- **React Native Paper Theme:** Leverage and extend the React Native Paper theme (`GoalGuard/src/constants/theme.ts`) to define base colors, fonts, and component styles that align with the new UI.
- **StyleSheet API:** Use `StyleSheet.create` for component-specific styles.
- **Flexbox:** Use Flexbox extensively for layout.
- **Utility-First (Optional):** If the new UI heavily relies on a utility-class approach like Tailwind, and you want to replicate that closely, consider integrating a React Native utility-first styling library (e.g., `twrnc`, `nativewind`). This would be a significant addition and should be decided upon before starting the component re-implementation. For this plan, we will assume standard `StyleSheet` and Paper theming.

## 6. Testing

- **Visual Testing:** After updating each screen/component, compare it against the `new_ui_temp` reference on different device sizes (using Expo Go or simulators).
- **Functional Testing:** Ensure all existing functionality remains intact after the UI changes. Test user flows, data display, and interactions.
- **Cross-Platform Testing (if applicable):** If Android is a target, test for consistency.

## 7. Iteration and Refinement

- This is an iterative process. Be prepared to adjust styles and layouts as you go.
- Seek feedback if possible.
- Prioritize core screens first, then move to less critical ones.

## 8. Post-Update Cleanup

- Remove the `new_ui_temp` directory once the UI update is complete and verified.
- Review for any unused old styles or components and remove them.

---

_This plan provides a structured approach. Details for each step will be refined as implementation progresses._
