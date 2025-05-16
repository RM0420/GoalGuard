import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Divider,
  Title,
  Paragraph,
  Caption,
  Button,
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

/**
 * `ProgressScreen` - Displays a history of the user's daily progress entries.
 * @returns {JSX.Element}
 */
export default function ProgressScreen() {
  const { user } = useAuth();
  const [progressHistory, setProgressHistory] = useState<
    DailyProgressHistoryEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
          user.id
        );
        if (apiError) {
          throw apiError;
        }
        setProgressHistory(data || []);
      } catch (e: any) {
        console.error("Failed to fetch progress history:", e);
        setError(
          `Failed to load progress history: ${e.message || "Unknown error"}`
        );
        setProgressHistory([]); // Clear history on error
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
          <Title>Date: {item.date}</Title>
          <Paragraph>
            Status:{" "}
            <Text
              style={{
                fontWeight: "bold",
                color: item.status === "completed" ? "green" : "orange",
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

  return (
    <FlatList
      data={progressHistory}
      renderItem={renderProgressItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <Text variant="headlineSmall" style={styles.header}>
          Your Daily Progress History
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
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
});
