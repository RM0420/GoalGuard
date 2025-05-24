import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Divider,
  Title,
  Paragraph,
  Caption,
  Button,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { getDailyProgressHistory } from "../../src/api/progressApi";
import { Database } from "../../src/types/database.types";

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
  const [progressHistory, setProgressHistory] = useState<
    DailyProgressHistoryEntry[]
  >([]);
  const [weeklyGroups, setWeeklyGroups] = useState<WeeklyProgressGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;

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

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{formatReadableDate(item.date)}</Title>
          <Paragraph>
            Status:{" "}
            <Text
              style={{
                fontWeight: "bold",
                color:
                  item.status === "completed"
                    ? "green"
                    : item.status === "skipped"
                    ? "purple"
                    : item.status === "missed"
                    ? "red"
                    : "orange",
              }}
            >
              {item.status || "N/A"}
            </Text>
          </Paragraph>
          {goalInfo && (
            <Paragraph>
              Goal: {goalInfo.goal_type} - {goalInfo.target_value}{" "}
              {goalInfo.target_unit}
            </Paragraph>
          )}
          <Caption>Progress: {progressDetails}</Caption>
          <Caption>
            Synced:{" "}
            {item.last_fetched_from_healthkit
              ? new Date(item.last_fetched_from_healthkit).toLocaleString()
              : "N/A"}
          </Caption>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading progress history...</Text>
      </View>
    );
  }

  if (error && progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={() => fetchHistory()} mode="outlined">
          Retry
        </Button>
      </View>
    );
  }

  if (progressHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No progress history found.</Text>
        <Text>Complete some daily goals to see your history here.</Text>
        <Button
          onPress={() => fetchHistory()}
          mode="text"
          style={{ marginTop: 10 }}
        >
          Refresh
        </Button>
      </View>
    );
  }

  // Render week carousel with navigation
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        Your Weekly Progress
      </Text>

      {weeklyGroups.length > 0 && (
        <View style={styles.weekNavigator}>
          <IconButton
            icon="chevron-left"
            disabled={currentWeekIndex >= weeklyGroups.length - 1}
            onPress={goToPreviousWeek}
          />
          <Text style={styles.weekTitle}>
            {formatReadableDate(weeklyGroups[currentWeekIndex].weekStart)} -{" "}
            {formatReadableDate(weeklyGroups[currentWeekIndex].weekEnd)}
          </Text>
          <IconButton
            icon="chevron-right"
            disabled={currentWeekIndex <= 0}
            onPress={goToNextWeek}
          />
        </View>
      )}

      <FlatList
        data={
          weeklyGroups.length > 0 ? weeklyGroups[currentWeekIndex].entries : []
        }
        renderItem={renderProgressItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  weekNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  weekTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
