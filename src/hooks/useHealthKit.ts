import { useState, useEffect } from "react";
import { Platform } from "react-native";
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthInputOptions,
  HealthUnit,
} from "react-native-health";

// Define the permissions your app needs
// We want to read steps and distance
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      // Add other permissions as needed, e.g., ActiveEnergyBurned
    ],
    write: [
      // We are not writing any data for now
      // AppleHealthKit.Constants.Permissions.Steps, // Example if you wanted to write steps
    ],
  },
};

interface HealthData {
  steps: number;
  distance: number; // in meters
  // Add other data points as needed
}

interface UseHealthKitOutput extends HealthData {
  isLoading: boolean;
  error: Error | null;
  requestPermissions: () => Promise<boolean>;
  fetchDailyHealthData: (date?: Date) => Promise<void>;
}

const useHealthKit = (): UseHealthKitOutput => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const [steps, setSteps] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  /**
   * Initializes HealthKit and requests permissions.
   * Should be called once, perhaps when a component mounts or user initiates action.
   */
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== "ios") {
      setError(new Error("HealthKit is only available on iOS."));
      return false;
    }
    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
        if (err) {
          console.error("[ERROR] Cannot grant HealthKit permissions!", err);
          setError(new Error(`Error initializing HealthKit: ${err}`));
          setHasPermissions(false);
          setIsLoading(false);
          resolve(false);
          return;
        }
        console.log("HealthKit permissions granted (or previously granted).");
        setHasPermissions(true);
        setIsLoading(false);
        resolve(true);
      });
    });
  };

  /**
   * Fetches daily step count and distance for a given date (defaults to today).
   * Assumes permissions have already been granted.
   */
  const fetchDailyHealthData = async (
    date: Date = new Date()
  ): Promise<void> => {
    if (Platform.OS !== "ios" || !hasPermissions) {
      if (!hasPermissions && Platform.OS === "ios") {
        setError(
          new Error(
            "HealthKit permissions not granted. Please request permissions first."
          )
        );
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: HealthInputOptions = {
      date: date.toISOString(), // Date for which to fetch data (typically today)
      includeManuallyAdded: true, // Consider data manually added by the user in Health app
    };

    // Fetch Steps
    AppleHealthKit.getStepCount(
      options,
      (err: string | null, result: HealthValue) => {
        if (err) {
          console.error("Error fetching step count:", err);
          setError(
            (prevError) =>
              new Error(
                `${
                  prevError?.message || ""
                }\nError fetching steps: ${err}`.trim()
              )
          );
          // Don't stop loading yet, try fetching distance
        }
        if (result) {
          console.log(`Steps for ${date.toDateString()}: ${result.value}`);
          setSteps(result.value);
        }
      }
    );

    // Fetch Distance Walking/Running
    // The unit for DistanceWalkingRunning is typically meters
    AppleHealthKit.getDistanceWalkingRunning(
      options,
      (err: string | null, result: HealthValue) => {
        setIsLoading(false); // Set loading to false after the last fetch attempt
        if (err) {
          console.error("Error fetching distance:", err);
          setError(
            (prevError) =>
              new Error(
                `${
                  prevError?.message || ""
                }\nError fetching distance: ${err}`.trim()
              )
          );
          return;
        }
        if (result) {
          console.log(
            `Distance for ${date.toDateString()}: ${result.value} meters`
          );
          setDistance(result.value); // Assuming value is in meters
        }
      }
    );
  };

  // Potentially auto-request permissions or fetch data if permissions are already granted
  // This depends on the desired UX. For now, we expose functions to be called manually.

  return {
    isLoading,
    error,
    steps,
    distance,
    requestPermissions,
    fetchDailyHealthData,
  };
};

export default useHealthKit;
