import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  useTheme,
  Badge,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { getDailyProgressHistory } from "../../src/api/progressApi";
import { Database } from "../../src/types/database.types";
import {
  StyledCard,
  CardContent,
} from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import StyledHeader from "../../src/components/common/StyledHeader";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "../../src/constants/theme";

// Define types for clarity
type DailyProgressRow = Database["public"]["Tables"]["daily_progress"]["Row"];
type GoalPartial = {
  goal_type: string | null;
  target_value: number | null;
  target_unit: string | null;
};
export type DailyProgressHistoryEntry = DailyProgressRow & {
  goals: GoalPartial | null; // Supabase join syntax makes this 'goals' not 'goal'
};

// Define a type for grouped progress data
type WeeklyProgressGroup = {
  weekStart: string;
  weekEnd: string;
  entries: DailyProgressHistoryEntry[];
};

/**
 * Gets the Monday date for a given date (start of the week)
 * @param date The date to get the Monday for
 * @returns Date representing the Monday of the week
 */
const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
};

/**
 * Gets the Sunday date for a given date (end of the week)
 * @param date The date to get the Sunday for
 * @returns Date representing the Sunday of the week
 */
const getSunday = (date: Date): Date => {
  const monday = getMonday(new Date(date));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

/**
 * Formats a date as YYYY-MM-DD
 * @param date The date to format
 * @returns The formatted date string
 */
const formatDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Formats a date as a more readable string (e.g., "Jan 1")
 * @param dateString The date string in YYYY-MM-DD format
 * @returns The formatted date string
 */
const formatReadableDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/**
 * Groups progress entries by week
 * @param entries The progress entries to group
 * @returns The entries grouped by week
 */
const groupProgressByWeek = (
  entries: DailyProgressHistoryEntry[]
): WeeklyProgressGroup[] => {
  const weeks: Record<string, WeeklyProgressGroup> = {};

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const weekStart = formatDateString(getMonday(new Date(entryDate)));
    const weekEnd = formatDateString(getSunday(new Date(entryDate)));
    const weekKey = weekStart;

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        weekStart,
        weekEnd,
        entries: [],
      };
    }

    weeks[weekKey].entries.push(entry);
  });

  // Sort entries within each week by date
  Object.values(weeks).forEach((week) => {
    week.entries.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  // Return as array sorted by most recent week first
  return Object.values(weeks).sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );
};

/**
 * `ProgressScreen` - Displays a history of the user's daily progress entries.
 * @returns {JSX.Element}
 */
export default function ProgressScreen() {
  const { user } = useAuth();
  const theme = useTheme<AppTheme>();
  const [progressHistory, setProgressHistory] = useState<
    DailyProgressHistoryEntry[]
  >([]);
  const [weeklyGroups, setWeeklyGroups] = useState<WeeklyProgressGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const fetchHistory = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setProgressHistory([]);
        setIsLoading(false);
        if (isRefresh) setRefreshing(false);
        return;
      }
      if (!isRefresh) setIsLoading(true);
      setError(null);

      try {
        const { data, error: apiError } = await getDailyProgressHistory(
          user.id,
          90 // Fetch up to 90 days of history
        );
        if (apiError) {
          throw apiError;
        }
        setProgressHistory(data || []);

        // Group the progress data by week
        const grouped = groupProgressByWeek(data || []);
        setWeeklyGroups(grouped);

        // Reset to first week if refreshing or data changes
        setCurrentWeekIndex(0);
      } catch (e: any) {
        console.error("Failed to fetch progress history:", e);
        setError(
          `Failed to load progress history: ${e.message || "Unknown error"}`
        );
        setProgressHistory([]);
        setWeeklyGroups([]);
      }
      if (!isRefresh) setIsLoading(false);
      if (isRefresh) setRefreshing(false);
    },
    [user]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, [fetchHistory]);

  const goToPreviousWeek = () => {
    if (currentWeekIndex < weeklyGroups.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return {
          gradient: [theme.colors.success500, theme.colors.success600] as [
            string,
            string
          ],
          badge: {
            bg: theme.colors.success100,
            text: theme.colors.onSurface,
          },
        };
      case "skipped":
        return {
          gradient: [theme.colors.purple500, theme.colors.purple600] as [
            string,
            string
          ],
          badge: {
            bg: theme.colors.purple100,
            text: theme.colors.onSurface,
          },
        };
      case "failed":
      case "missed":
        return {
          gradient: [theme.colors.warning500, theme.colors.warning600] as [
            string,
            string
          ],
          badge: {
            bg: theme.colors.warning100,
            text: theme.colors.onSurface,
          },
        };
      default:
        return {
          gradient: [
            theme.colors.customMuted,
            theme.colors.customMutedForeground,
          ] as [string, string],
          badge: {
            bg: theme.colors.customMuted,
            text: theme.colors.onSurface,
          },
        };
    }
  };

  const renderProgressItem = ({
    item,
  }: {
    item: DailyProgressHistoryEntry;
  }) => {
    const goalInfo = item.goals;
    let progressDetails = "No progress data.";
    if (item.progress_data) {
      const pd = item.progress_data as {
        steps_count?: number;
        distance_ran_km?: number;
      };
      const parts = [];
      if (pd.steps_count !== undefined) parts.push(`Steps: ${pd.steps_count}`);
      if (pd.distance_ran_km !== undefined)
        parts.push(`Distance: ${pd.distance_ran_km.toFixed(2)} km`);
      if (parts.length > 0) progressDetails = parts.join(", ");
    }

    const statusColors = getStatusColor(item.status);
    const isCompleted = item.status === "completed";

    return (
      <StyledCard style={styles.card} withShadow>
        <View style={styles.cardContentWrapper}>
          {/* Status Indicator */}
          <LinearGradient
            colors={statusColors.gradient}
            style={styles.statusIndicator}
          >
            <IconButton
              icon={isCompleted ? "check-circle" : "close-circle"}
              iconColor="white"
              size={24}
            />
          </LinearGradient>

          {/* Content */}
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.dateText}>
                {formatReadableDate(item.date)}
              </Text>
              <Text
                style={{
                  backgroundColor: statusColors.badge.bg,
                  color: theme.colors.onSurface,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: "500",
                  alignSelf: "flex-start",
                }}
              >
                {`Status: ${item.status || "N/A"}`}
              </Text>
            </View>

            <View style={styles.cardDetails}>
              {goalInfo && (
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Goal:</Text>{" "}
                  {goalInfo.goal_type} - {goalInfo.target_value}{" "}
                  {goalInfo.target_unit}
                </Text>
              )}
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Progress:</Text>{" "}
                {progressDetails}
              </Text>
              <Text style={styles.syncedText}>
                <Text style={styles.detailLabel}>Synced:</Text>{" "}
                {item.last_fetched_from_healthkit
                  ? new Date(item.last_fetched_from_healthkit).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
          </CardContent>
        </View>
      </StyledCard>
    );
  };

  if (isLoading && progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
        <Text style={styles.loadingText}>Loading progress history...</Text>
      </View>
    );
  }

  if (error && progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <StyledButton
          onPress={() => fetchHistory()}
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Retry
        </StyledButton>
      </View>
    );
  }

  if (progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyStateTitle}>No progress history found.</Text>
        <Text style={styles.emptyStateDescription}>
          Complete some daily goals to see your history here.
        </Text>
        <StyledButton
          onPress={() => fetchHistory()}
          variant="ghost"
          style={{ marginTop: 16 }}
        >
          Refresh
        </StyledButton>
      </View>
    );
  }

  // Render week carousel with navigation
  return (
    <View style={styles.container}>
      <StyledHeader title="Progress" />

      <LinearGradient
        colors={
          [theme.colors.purple50, theme.colors.customBackground] as [
            string,
            string
          ]
        }
        style={styles.gradientBackground}
      >
        {weeklyGroups.length > 0 && (
          <StyledCard style={styles.weekNavigatorCard} withShadow>
            <CardContent style={styles.weekNavigator}>
              <IconButton
                icon="chevron-left"
                disabled={currentWeekIndex >= weeklyGroups.length - 1}
                onPress={goToPreviousWeek}
                iconColor={theme.colors.onSurface}
              />
              <View style={styles.weekTitleContainer}>
                <IconButton
                  icon="calendar"
                  size={18}
                  iconColor={theme.colors.primary}
                  style={styles.calendarIcon}
                />
                <Text style={styles.weekTitle}>
                  {formatReadableDate(weeklyGroups[currentWeekIndex].weekStart)}{" "}
                  - {formatReadableDate(weeklyGroups[currentWeekIndex].weekEnd)}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                disabled={currentWeekIndex <= 0}
                onPress={goToNextWeek}
                iconColor={theme.colors.onSurface}
              />
            </CardContent>
          </StyledCard>
        )}

        <FlatList
          data={
            weeklyGroups.length > 0
              ? weeklyGroups[currentWeekIndex].entries
              : []
          }
          renderItem={renderProgressItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    marginVertical: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  card: {
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 12,
    elevation: 3,
  },
  cardContentWrapper: {
    flexDirection: "row",
  },
  statusIndicator: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: "600",
  },
  syncedText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
  weekNavigatorCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  weekNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  weekTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    margin: 0,
    marginRight: 4,
  },
  weekTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
});
