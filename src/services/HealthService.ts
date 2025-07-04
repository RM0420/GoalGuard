import { Platform } from "react-native";

/**
 * @interface HealthData
 * Defines the structure for health data that might be fetched.
 */
export interface HealthData {
  steps?: number;
  distance?: number; // Assuming kilometers
  // Add other data types as needed, e.g., activeEnergyBurned, flightsClimbed
}

/**
 * @interface HealthServiceAPI
 * Defines the contract for our HealthService, whether mock or real.
 */
export interface HealthServiceAPI {
  initialize: () => Promise<boolean>;
  getTodaysSteps: () => Promise<number | null>;
  getTodaysDistance: () => Promise<number | null>; // in kilometers
  // Add other methods like getActiveEnergy, getFlightsClimbed etc.
}

/**
 * @const mockHealthService
 * A mock implementation of the HealthServiceAPI.
 * This service simulates HealthKit interactions for development purposes,
 * especially when running in environments where native HealthKit is unavailable (e.g., Expo Go).
 */
const mockHealthService: HealthServiceAPI = {
  /**
   * Simulates the initialization of HealthKit.
   * In a real scenario, this would request permissions.
   * @returns {Promise<boolean>} True if "initialized", false otherwise.
   */
  initialize: async (): Promise<boolean> => {
    console.log("MockHealthService: Initializing HealthKit (simulated).");
    if (Platform.OS !== "ios") {
      console.warn(
        "MockHealthService: HealthKit is only available on iOS. Mock will still proceed."
      );
    }
    return true;
  },

  /**
   * Simulates fetching today's step count.
   * @returns {Promise<number | null>} A simulated step count or null if "unavailable".
   */
  getTodaysSteps: async (): Promise<number | null> => {
    const mockSteps = Math.floor(Math.random() * 15000) + 500; // Random steps between 500 and 15500
    console.log(`MockHealthService: Returning dummy steps - ${mockSteps}`);
    return mockSteps;
  },

  /**
   * Simulates fetching today's walking/running distance.
   * @returns {Promise<number | null>} A simulated distance in kilometers or null if "unavailable".
   */
  getTodaysDistance: async (): Promise<number | null> => {
    const mockDistance = parseFloat((Math.random() * 10).toFixed(1)); // Random distance between 0.0 and 10.0 km
    console.log(
      `MockHealthService: Returning dummy distance - ${mockDistance} km`
    );
    return mockDistance;
  },
};

// Real HealthKit implementation
let realHealthService: HealthServiceAPI | null = null;

try {
  // Only import react-native-health on iOS in a production build
  if (Platform.OS === "ios") {
    const AppleHealthKit = require("react-native-health").default;

    const HEALTHKIT_PERMISSIONS = {
      permissions: {
        read: [
          "Steps",
          "DistanceWalkingRunning",
          "FlightsClimbed",
          "ActiveEnergyBurned",
        ],
        write: [], // We don't need write permissions for now
      },
    };

    realHealthService = {
      /**
       * Initialize HealthKit and request permissions
       * @returns {Promise<boolean>} True if permissions granted, false otherwise
       */
      initialize: async (): Promise<boolean> => {
        return new Promise((resolve) => {
          AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error: any) => {
            if (error) {
              console.log("HealthKit initialization failed:", error);
              resolve(false);
            } else {
              console.log("HealthKit initialized successfully");
              resolve(true);
            }
          });
        });
      },

      /**
       * Fetch today's step count from HealthKit
       * @returns {Promise<number | null>} Step count or null if unavailable
       */
      getTodaysSteps: async (): Promise<number | null> => {
        return new Promise((resolve) => {
          const today = new Date();
          const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          const options = {
            startDate: startOfDay.toISOString(),
            endDate: today.toISOString(),
          };

          AppleHealthKit.getStepCount(options, (err: any, results: any) => {
            if (err) {
              console.log("Error getting step count:", err);
              resolve(null);
            } else {
              const steps = results?.value || 0;
              console.log(`HealthKit: Retrieved ${steps} steps for today`);
              resolve(steps);
            }
          });
        });
      },

      /**
       * Fetch today's walking/running distance from HealthKit
       * @returns {Promise<number | null>} Distance in kilometers or null if unavailable
       */
      getTodaysDistance: async (): Promise<number | null> => {
        return new Promise((resolve) => {
          const today = new Date();
          const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          const options = {
            startDate: startOfDay.toISOString(),
            endDate: today.toISOString(),
            unit: "meter", // Get in meters, we'll convert to km
          };

          AppleHealthKit.getDistanceWalkingRunning(
            options,
            (err: any, results: any) => {
              if (err) {
                console.log("Error getting distance:", err);
                resolve(null);
              } else {
                const distanceInMeters = results?.value || 0;
                const distanceInKm = distanceInMeters / 1000;
                console.log(
                  `HealthKit: Retrieved ${distanceInKm.toFixed(
                    2
                  )} km distance for today`
                );
                resolve(parseFloat(distanceInKm.toFixed(2)));
              }
            }
          );
        });
      },
    };
  }
} catch (error) {
  console.log("react-native-health not available, using mock service:", error);
}

// Export the appropriate service based on availability
export const HealthService: HealthServiceAPI =
  realHealthService || mockHealthService;
