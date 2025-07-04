import { Platform } from "react-native";

/**
 * @interface AppInfo
 * Information about an installed app for Screen Time management
 */
export interface AppInfo {
  bundleId: string;
  displayName: string;
  category?: string;
  icon?: string;
}

/**
 * @interface ScreenTimeServiceAPI
 * Defines the contract for Screen Time management
 */
export interface ScreenTimeServiceAPI {
  initialize: () => Promise<boolean>;
  requestAuthorization: () => Promise<boolean>;
  getInstalledApps: () => Promise<AppInfo[]>;
  blockApps: (bundleIds: string[]) => Promise<boolean>;
  unblockApps: (bundleIds: string[]) => Promise<boolean>;
  isAppBlocked: (bundleId: string) => Promise<boolean>;
  getBlockedApps: () => Promise<string[]>;
}

/**
 * Mock Screen Time service for development and non-iOS platforms
 */
const mockScreenTimeService: ScreenTimeServiceAPI = {
  initialize: async (): Promise<boolean> => {
    console.log("MockScreenTimeService: Initializing Screen Time (simulated).");
    if (Platform.OS !== "ios") {
      console.warn(
        "MockScreenTimeService: Screen Time is only available on iOS. Mock will proceed."
      );
    }
    return true;
  },

  requestAuthorization: async (): Promise<boolean> => {
    console.log(
      "MockScreenTimeService: Requesting Screen Time authorization (simulated)."
    );
    return true;
  },

  getInstalledApps: async (): Promise<AppInfo[]> => {
    const mockApps: AppInfo[] = [
      {
        bundleId: "com.facebook.Facebook",
        displayName: "Facebook",
        category: "Social",
      },
      {
        bundleId: "com.instagram.Instagram",
        displayName: "Instagram",
        category: "Social",
      },
      {
        bundleId: "com.twitter.twitter",
        displayName: "Twitter",
        category: "Social",
      },
      {
        bundleId: "com.google.youtube",
        displayName: "YouTube",
        category: "Entertainment",
      },
      {
        bundleId: "com.netflix.Netflix",
        displayName: "Netflix",
        category: "Entertainment",
      },
      {
        bundleId: "com.spotify.client",
        displayName: "Spotify",
        category: "Music",
      },
      {
        bundleId: "com.tiktok.TikTok",
        displayName: "TikTok",
        category: "Social",
      },
      {
        bundleId: "com.snapchat.snapchat",
        displayName: "Snapchat",
        category: "Social",
      },
    ];

    console.log(
      `MockScreenTimeService: Returning ${mockApps.length} mock apps`
    );
    return mockApps;
  },

  blockApps: async (bundleIds: string[]): Promise<boolean> => {
    console.log(
      `MockScreenTimeService: Blocking apps: ${bundleIds.join(", ")}`
    );
    return true;
  },

  unblockApps: async (bundleIds: string[]): Promise<boolean> => {
    console.log(
      `MockScreenTimeService: Unblocking apps: ${bundleIds.join(", ")}`
    );
    return true;
  },

  isAppBlocked: async (bundleId: string): Promise<boolean> => {
    // Simulate some apps being blocked
    const blockedApps = ["com.facebook.Facebook", "com.instagram.Instagram"];
    const isBlocked = blockedApps.includes(bundleId);
    console.log(
      `MockScreenTimeService: App ${bundleId} is ${
        isBlocked ? "blocked" : "not blocked"
      }`
    );
    return isBlocked;
  },

  getBlockedApps: async (): Promise<string[]> => {
    const blockedApps = ["com.facebook.Facebook", "com.instagram.Instagram"];
    console.log(
      `MockScreenTimeService: Currently blocked apps: ${blockedApps.join(", ")}`
    );
    return blockedApps;
  },
};

// Real Screen Time implementation (will be implemented using native modules)
let realScreenTimeService: ScreenTimeServiceAPI | null = null;

try {
  if (Platform.OS === "ios") {
    // For now, we'll create a placeholder for the real implementation
    // This will be replaced with actual native module calls when we build

    realScreenTimeService = {
      initialize: async (): Promise<boolean> => {
        // This would call our native iOS module
        console.log(
          "RealScreenTimeService: Initializing Family Controls framework"
        );

        // For now, fall back to mock since we need native module
        console.log("Real Screen Time not yet implemented, using mock");
        return mockScreenTimeService.initialize();
      },

      requestAuthorization: async (): Promise<boolean> => {
        // This would call: AuthorizationCenter.shared.requestAuthorization()
        console.log(
          "RealScreenTimeService: Requesting Family Controls authorization"
        );

        // For now, fall back to mock
        return mockScreenTimeService.requestAuthorization();
      },

      getInstalledApps: async (): Promise<AppInfo[]> => {
        // This would use ManagedSettings and DeviceActivity frameworks
        console.log("RealScreenTimeService: Fetching installed apps");

        // For now, fall back to mock
        return mockScreenTimeService.getInstalledApps();
      },

      blockApps: async (bundleIds: string[]): Promise<boolean> => {
        // This would update ManagedSettings.shared.application
        console.log(
          `RealScreenTimeService: Blocking apps: ${bundleIds.join(", ")}`
        );

        // For now, fall back to mock
        return mockScreenTimeService.blockApps(bundleIds);
      },

      unblockApps: async (bundleIds: string[]): Promise<boolean> => {
        // This would clear restrictions in ManagedSettings.shared.application
        console.log(
          `RealScreenTimeService: Unblocking apps: ${bundleIds.join(", ")}`
        );

        // For now, fall back to mock
        return mockScreenTimeService.unblockApps(bundleIds);
      },

      isAppBlocked: async (bundleId: string): Promise<boolean> => {
        // This would check current ManagedSettings state
        console.log(
          `RealScreenTimeService: Checking if ${bundleId} is blocked`
        );

        // For now, fall back to mock
        return mockScreenTimeService.isAppBlocked(bundleId);
      },

      getBlockedApps: async (): Promise<string[]> => {
        // This would read current blocked apps from ManagedSettings
        console.log("RealScreenTimeService: Getting currently blocked apps");

        // For now, fall back to mock
        return mockScreenTimeService.getBlockedApps();
      },
    };
  }
} catch (error) {
  console.log(
    "Screen Time native modules not available, using mock service:",
    error
  );
}

// Export the appropriate service
export const ScreenTimeService: ScreenTimeServiceAPI =
  realScreenTimeService || mockScreenTimeService;

// Utility functions for common Screen Time operations
export const ScreenTimeUtils = {
  /**
   * Get apps categorized by type for easier management
   */
  categorizeApps: (apps: AppInfo[]): Record<string, AppInfo[]> => {
    const categories: Record<string, AppInfo[]> = {
      Social: [],
      Entertainment: [],
      Games: [],
      Shopping: [],
      Other: [],
    };

    apps.forEach((app) => {
      const category = app.category || "Other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(app);
    });

    return categories;
  },

  /**
   * Get commonly blocked social media apps
   */
  getSocialMediaApps: (apps: AppInfo[]): AppInfo[] => {
    const socialBundleIds = [
      "com.facebook.Facebook",
      "com.instagram.Instagram",
      "com.twitter.twitter",
      "com.tiktok.TikTok",
      "com.snapchat.snapchat",
      "com.linkedin.LinkedIn",
    ];

    return apps.filter((app) => socialBundleIds.includes(app.bundleId));
  },

  /**
   * Get commonly blocked entertainment apps
   */
  getEntertainmentApps: (apps: AppInfo[]): AppInfo[] => {
    const entertainmentBundleIds = [
      "com.google.youtube",
      "com.netflix.Netflix",
      "com.disney.disneyplus",
      "com.hulu.plus",
      "com.amazon.aiv.AIVApp",
    ];

    return apps.filter((app) => entertainmentBundleIds.includes(app.bundleId));
  },
};
