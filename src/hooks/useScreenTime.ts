import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import {
  ScreenTimeService,
  ScreenTimeUtils,
  AppInfo,
} from "../services/ScreenTimeService";

interface UseScreenTimeOutput {
  isLoading: boolean;
  error: Error | null;
  hasAuthorization: boolean;
  installedApps: AppInfo[];
  blockedApps: string[];
  requestAuthorization: () => Promise<boolean>;
  loadInstalledApps: () => Promise<void>;
  blockApps: (bundleIds: string[]) => Promise<boolean>;
  unblockApps: (bundleIds: string[]) => Promise<boolean>;
  isAppBlocked: (bundleId: string) => Promise<boolean>;
  refreshBlockedApps: () => Promise<void>;
  blockSocialMediaApps: () => Promise<boolean>;
  blockEntertainmentApps: () => Promise<boolean>;
  unblockAllApps: () => Promise<boolean>;
  categorizedApps: Record<string, AppInfo[]>;
}

const useScreenTime = (): UseScreenTimeOutput => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasAuthorization, setHasAuthorization] = useState<boolean>(false);
  const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
  const [blockedApps, setBlockedApps] = useState<string[]>([]);

  /**
   * Request Screen Time authorization from the user
   */
  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize the service first
      const initialized = await ScreenTimeService.initialize();
      if (!initialized) {
        throw new Error("Failed to initialize Screen Time service");
      }

      // Request authorization
      const authorized = await ScreenTimeService.requestAuthorization();
      setHasAuthorization(authorized);

      if (!authorized && Platform.OS === "ios") {
        setError(new Error("Screen Time authorization was denied"));
      }

      return authorized;
    } catch (e: any) {
      console.error("[ERROR] Cannot get Screen Time authorization!", e);
      setError(
        new Error(
          `Error requesting Screen Time authorization: ${
            e.message || e.toString()
          }`
        )
      );
      setHasAuthorization(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load the list of installed apps
   */
  const loadInstalledApps = useCallback(async (): Promise<void> => {
    if (!hasAuthorization && Platform.OS === "ios") {
      setError(new Error("Screen Time authorization required to load apps"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apps = await ScreenTimeService.getInstalledApps();
      setInstalledApps(apps);
    } catch (e: any) {
      console.error("Error loading installed apps:", e);
      setError(new Error(`Error loading apps: ${e.message || e.toString()}`));
      setInstalledApps([]);
    } finally {
      setIsLoading(false);
    }
  }, [hasAuthorization]);

  /**
   * Block specific apps by bundle ID
   */
  const blockApps = useCallback(
    async (bundleIds: string[]): Promise<boolean> => {
      if (!hasAuthorization && Platform.OS === "ios") {
        setError(new Error("Screen Time authorization required to block apps"));
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const success = await ScreenTimeService.blockApps(bundleIds);
        if (success) {
          // Update local blocked apps list
          await refreshBlockedApps();
        }
        return success;
      } catch (e: any) {
        console.error("Error blocking apps:", e);
        setError(
          new Error(`Error blocking apps: ${e.message || e.toString()}`)
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [hasAuthorization]
  );

  /**
   * Unblock specific apps by bundle ID
   */
  const unblockApps = useCallback(
    async (bundleIds: string[]): Promise<boolean> => {
      if (!hasAuthorization && Platform.OS === "ios") {
        setError(
          new Error("Screen Time authorization required to unblock apps")
        );
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const success = await ScreenTimeService.unblockApps(bundleIds);
        if (success) {
          // Update local blocked apps list
          await refreshBlockedApps();
        }
        return success;
      } catch (e: any) {
        console.error("Error unblocking apps:", e);
        setError(
          new Error(`Error unblocking apps: ${e.message || e.toString()}`)
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [hasAuthorization]
  );

  /**
   * Check if a specific app is blocked
   */
  const isAppBlocked = useCallback(
    async (bundleId: string): Promise<boolean> => {
      try {
        return await ScreenTimeService.isAppBlocked(bundleId);
      } catch (e: any) {
        console.error("Error checking app block status:", e);
        return false;
      }
    },
    []
  );

  /**
   * Refresh the list of currently blocked apps
   */
  const refreshBlockedApps = useCallback(async (): Promise<void> => {
    try {
      const blocked = await ScreenTimeService.getBlockedApps();
      setBlockedApps(blocked);
    } catch (e: any) {
      console.error("Error refreshing blocked apps:", e);
      setError(
        new Error(`Error refreshing blocked apps: ${e.message || e.toString()}`)
      );
    }
  }, []);

  /**
   * Convenience method to block all social media apps
   */
  const blockSocialMediaApps = useCallback(async (): Promise<boolean> => {
    const socialApps = ScreenTimeUtils.getSocialMediaApps(installedApps);
    const bundleIds = socialApps.map((app) => app.bundleId);
    return await blockApps(bundleIds);
  }, [installedApps, blockApps]);

  /**
   * Convenience method to block all entertainment apps
   */
  const blockEntertainmentApps = useCallback(async (): Promise<boolean> => {
    const entertainmentApps =
      ScreenTimeUtils.getEntertainmentApps(installedApps);
    const bundleIds = entertainmentApps.map((app) => app.bundleId);
    return await blockApps(bundleIds);
  }, [installedApps, blockApps]);

  /**
   * Convenience method to unblock all apps
   */
  const unblockAllApps = useCallback(async (): Promise<boolean> => {
    if (blockedApps.length === 0) {
      return true; // No apps to unblock
    }
    return await unblockApps(blockedApps);
  }, [blockedApps, unblockApps]);

  /**
   * Get apps categorized by type
   */
  const categorizedApps = ScreenTimeUtils.categorizeApps(installedApps);

  // Load blocked apps when authorization status changes
  useEffect(() => {
    if (hasAuthorization) {
      refreshBlockedApps();
    }
  }, [hasAuthorization, refreshBlockedApps]);

  return {
    isLoading,
    error,
    hasAuthorization,
    installedApps,
    blockedApps,
    requestAuthorization,
    loadInstalledApps,
    blockApps,
    unblockApps,
    isAppBlocked,
    refreshBlockedApps,
    blockSocialMediaApps,
    blockEntertainmentApps,
    unblockAllApps,
    categorizedApps,
  };
};

export default useScreenTime;
