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
   * Simulates fetching today\'s step count.
   * @returns {Promise<number | null>} A simulated step count or null if "unavailable".
   */
  getTodaysSteps: async (): Promise<number | null> => {
    const mockSteps = Math.floor(Math.random() * 15000) + 500; // Random steps between 500 and 15500
    console.log(`MockHealthService: Returning dummy steps - ${mockSteps}`);
    return mockSteps;
  },

  /**
   * Simulates fetching today\'s walking/running distance.
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

export const HealthService: HealthServiceAPI = mockHealthService;

// Example of how you might switch later:
// import Config from "react-native-config"; // Or some other env variable solution
// const useMock = __DEV__; // Or: Config.USE_MOCK_HEALTH_SERVICE === "true"
//
// export const HealthService: HealthServiceAPI = useMock ? mockHealthService : realHealthService;
// (where realHealthService would be imported from another file containing actual react-native-health logic)
