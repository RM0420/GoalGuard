/**
 * Utility functions for date and timezone handling in the app
 */

/**
 * Gets today's date in the specified timezone in YYYY-MM-DD format.
 * Uses a safer approach to avoid "Date value out of bounds" errors.
 *
 * @param timezone - Timezone to use, defaults to America/New_York
 * @returns Date string in YYYY-MM-DD format
 */
export const getTodayInTimezone = (
  timezone: string = "America/New_York"
): string => {
  try {
    // Get current date
    const now = new Date();

    // Handle timezone safely by using direct date components
    // This avoids the potential "Date value out of bounds" error
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Format the date and convert to YYYY-MM-DD
    const parts = formatter.formatToParts(now);
    const month = parts.find((part) => part.type === "month")?.value || "01";
    const day = parts.find((part) => part.type === "day")?.value || "01";
    const year = parts.find((part) => part.type === "year")?.value || "2023";

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error in getTodayInTimezone:", error);
    // Fallback to UTC date if there's an error
    const now = new Date();
    return now.toISOString().split("T")[0];
  }
};

/**
 * Gets yesterday's date in the specified timezone in YYYY-MM-DD format.
 * Uses a safer approach to avoid "Date value out of bounds" errors.
 *
 * @param timezone - Timezone to use, defaults to America/New_York
 * @returns Date string in YYYY-MM-DD format
 */
export const getYesterdayInTimezone = (
  timezone: string = "America/New_York"
): string => {
  try {
    // Get current date
    const now = new Date();

    // Subtract one day from the current date
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    // Handle timezone safely
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Format the date and convert to YYYY-MM-DD
    const parts = formatter.formatToParts(yesterday);
    const month = parts.find((part) => part.type === "month")?.value || "01";
    const day = parts.find((part) => part.type === "day")?.value || "01";
    const year = parts.find((part) => part.type === "year")?.value || "2023";

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error in getYesterdayInTimezone:", error);
    // Fallback to UTC date if there's an error
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return now.toISOString().split("T")[0];
  }
};

/**
 * Formats a date string (YYYY-MM-DD) to a human-readable format
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  format: "short" | "medium" | "long" | "full" = "medium"
): string => {
  try {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      weekday: format === "short" ? undefined : "long",
      month: format === "short" ? "numeric" : "long",
      day: "numeric",
      year: format === "short" ? "2-digit" : "numeric",
    });
  } catch (error) {
    console.error("Error in formatDate:", error);
    return dateString; // Return the original string if there's an error
  }
};

/**
 * Checks if a date is today in the specified timezone
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timezone - Timezone to use, defaults to America/New_York
 * @returns Boolean indicating if the date is today
 */
export const isToday = (
  dateString: string,
  timezone: string = "America/New_York"
): boolean => {
  try {
    return dateString === getTodayInTimezone(timezone);
  } catch (error) {
    console.error("Error in isToday:", error);
    return false;
  }
};

/**
 * Checks if a date is yesterday in the specified timezone
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timezone - Timezone to use, defaults to America/New_York
 * @returns Boolean indicating if the date is yesterday
 */
export const isYesterday = (
  dateString: string,
  timezone: string = "America/New_York"
): boolean => {
  try {
    return dateString === getYesterdayInTimezone(timezone);
  } catch (error) {
    console.error("Error in isYesterday:", error);
    return false;
  }
};
