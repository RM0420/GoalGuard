import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import {
  HealthService,
  HealthData as ServiceHealthData,
} from "../services/HealthService";

interface HealthKitData extends ServiceHealthData {
  // Inherits steps?: number, distance?: number (in km from service)
  // Add any additional UI-specific transformations or properties if needed
}

interface UseHealthKitOutput extends HealthKitData {
  isLoading: boolean;
  error: Error | null;
  hasPermissions: boolean;
  requestPermissions: () => Promise<boolean>;
  fetchDailyHealthData: (date?: Date) => Promise<void>;
}

const useHealthKit = (): UseHealthKitOutput => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const [steps, setSteps] = useState<number | undefined>(undefined);
  const [distance, setDistance] = useState<number | undefined>(undefined); // Distance in km as per service

  /**
   * Initializes the HealthService (which simulates permission granting for the mock).
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    // The mock service's initialize() also checks Platform.OS
    setIsLoading(true);
    setError(null);
    try {
      const success = await HealthService.initialize();
      setHasPermissions(success);
      if (!success && Platform.OS === "ios") {
        // If real initialization failed on iOS
        setError(new Error("Failed to initialize HealthKit service."));
      } else if (!success) {
        // For mock or non-iOS, initialize might return true but good to note
        console.log("HealthService initialized (mock or non-iOS).");
      }
      return success;
    } catch (e: any) {
      console.error("[ERROR] Cannot grant HealthKit permissions!", e);
      setError(
        new Error(`Error initializing HealthKit: ${e.message || e.toString()}`)
      );
      setHasPermissions(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches daily step count and distance using the HealthService.
   */
  const fetchDailyHealthData = useCallback(
    async (_date?: Date): Promise<void> => {
      // The mock service doesn't currently use the date parameter but it's kept for API consistency
      if (!hasPermissions && Platform.OS === "ios") {
        setError(
          new Error(
            "HealthKit permissions not granted. Please request permissions first."
          )
        );
        // For non-iOS or mock, we might proceed if initialization was "successful"
        // but actual data fetching depends on the service's behavior
      }
      if (!hasPermissions && Platform.OS !== "ios") {
        // Allow mock data fetching even if "permissions" (initialize) were notionally false for non-iOS
        console.log(
          "Proceeding with mock data fetch on non-iOS platform or without explicit permissions."
        );
      } else if (!hasPermissions) {
        setError(
          new Error("Permissions not granted. Cannot fetch health data.")
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const todaySteps = await HealthService.getTodaysSteps();
        const todayDistance = await HealthService.getTodaysDistance();

        if (todaySteps !== null) {
          setSteps(todaySteps);
        } else {
          // Optionally set error or leave as undefined if service returns null for "unavailable"
          console.log("Steps data unavailable from service.");
        }

        if (todayDistance !== null) {
          setDistance(todayDistance); // Service provides distance in km
        } else {
          console.log("Distance data unavailable from service.");
        }
      } catch (e: any) {
        console.error("Error fetching health data from service:", e);
        setError(
          new Error(`Error fetching health data: ${e.message || e.toString()}`)
        );
        setSteps(undefined);
        setDistance(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [hasPermissions]
  );

  // Expose steps and distance from state
  return {
    isLoading,
    error,
    hasPermissions,
    steps,
    distance, // This will be in km
    requestPermissions,
    fetchDailyHealthData,
  };
};

export default useHealthKit;
