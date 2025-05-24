import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Text,
  ActivityIndicator,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { useGoals } from "../../src/contexts/GoalsContext";
import { Database } from "../../src/types/database.types";
import { StyledButton } from "../../src/components/common/StyledButton";
import {
  StyledCard,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../src/components/common/StyledCard";
import { Progress } from "../../src/components/common/Progress";
import Badge from "../../src/components/common/Badge";
import { AppTheme } from "../../src/constants/theme";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type DailyProgress = Database["public"]["Tables"]["daily_progress"]["Row"];

// Mock HealthKit data for development
const useMockHealthKit = () => {
  const [steps, setSteps] = useState<number | undefined>(7500);
  const [distance, setDistance] = useState<number | undefined>(3.2);
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, randomly increase values when refreshed
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setSteps(Math.floor(Math.random() * 5000) + 5000); // Random between 5000-10000
      setDistance(parseFloat((Math.random() * 3 + 2).toFixed(2))); // Random between 2.00-5.00
      setIsLoading(false);
    }, 1000);
  }, []);

  return { steps, distance, isLoading, refreshData };
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const {
    userGoal,
    isLoadingGoal,
    todayProgress,
    isLoadingProgress,
    fetchUserGoal,
    fetchDailyProgress,
  } = useGoals();
  const theme = useTheme<AppTheme>();
  const router = useRouter();

  // Mock HealthKit data (replace with actual HealthKit integration)
  const {
    steps,
    distance,
    isLoading: isLoadingHealthData,
    refreshData,
  } = useMockHealthKit();

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    if (!userGoal) return 0;

    if (userGoal.goal_type === "steps" && steps !== undefined) {
      return Math.min(steps / userGoal.target_value, 1);
    } else if (
      userGoal.goal_type === "run_distance" &&
      distance !== undefined
    ) {
      return Math.min(distance / userGoal.target_value, 1);
    }
    return 0;
  }, [userGoal, steps, distance]);

  // Get progress percentage as 0-100 value for Progress component
  const getProgressPercentage = useCallback(() => {
    return Math.round(calculateProgress() * 100);
  }, [calculateProgress]);

  // Refresh all data
  const handleRefresh = useCallback(() => {
    if (user) {
      fetchUserGoal();
      const todayStr = new Date().toISOString().split("T")[0];
      fetchDailyProgress(todayStr);
      refreshData();
    }
  }, [user, fetchUserGoal, fetchDailyProgress, refreshData]);

  // Effect to refresh data when component mounts
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const getStatusBadge = () => {
    if (calculateProgress() >= 1) {
      return (
        <Badge variant="success" style={styles.statusBadge}>
          <MaterialCommunityIcons
            name="check-circle"
            size={14}
            color="#059669"
            style={{ marginRight: 4 }}
          />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" style={styles.statusBadge}>
          <MaterialCommunityIcons
            name="help-circle"
            size={14}
            color="#D97706"
            style={{ marginRight: 4 }}
          />
          Pending
        </Badge>
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: theme.colors.customBackground },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* User Profile Card */}
      <StyledCard
        withShadow
        variant="gradient-purple"
        style={styles.profileCard}
      >
        <CardContent>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account" size={28} color="white" />
            </View>
            <Text style={styles.profileName}>
              Welcome,{" "}
              {profile?.username || user?.email?.split("@")[0] || "User"}
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#F59E0B"
                style={styles.statIcon}
              />
              <Text style={styles.statText}>Coins</Text>
            </View>
            <Text style={styles.statValue}>{profile?.coin_balance || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={20}
                color="#F97316"
                style={styles.statIcon}
              />
              <Text style={styles.statText}>Streak</Text>
            </View>
            <Text style={styles.statValue}>
              {profile?.current_streak_length || 0} days
            </Text>
          </View>
        </CardContent>
      </StyledCard>

      {/* Daily Goal Card */}
      <StyledCard withShadow style={styles.goalCard}>
        <CardHeader>
          <View style={styles.goalCardHeader}>
            <View style={styles.goalTitleContainer}>
              <MaterialCommunityIcons
                name="target"
                size={20}
                color={theme.colors.purple700}
                style={styles.goalIcon}
              />
              <Text style={styles.goalTitle}>Today's Goal</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={
                isLoadingGoal || isLoadingProgress || isLoadingHealthData
              }
            >
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color={theme.colors.purple700}
              />
              <Text style={styles.refreshText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        </CardHeader>
        <CardContent>
          {isLoadingGoal || isLoadingProgress || isLoadingHealthData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.purple700} />
              <Text style={styles.loadingText}>Loading goal data...</Text>
            </View>
          ) : !userGoal ? (
            <View style={styles.noGoalContainer}>
              <Text style={styles.noGoalText}>No active goal set.</Text>
              <StyledButton
                variant="default"
                onPress={() => router.push("/(tabs)/goals")}
                style={styles.setGoalButton}
              >
                Set a Goal
              </StyledButton>
            </View>
          ) : (
            <View style={styles.goalContent}>
              <Text style={styles.goalDescription}>
                {userGoal.goal_type === "steps"
                  ? `Walk/Run ${userGoal.target_value.toLocaleString()} steps`
                  : userGoal.goal_type === "run_distance"
                  ? `Run ${userGoal.target_value} ${userGoal.target_unit}`
                  : "Goal details unavailable"}
              </Text>

              <View style={styles.progressTextContainer}>
                <Text style={styles.progressNumber}>
                  {userGoal.goal_type === "steps" && steps !== undefined
                    ? steps.toLocaleString()
                    : userGoal.goal_type === "run_distance" &&
                      distance !== undefined
                    ? distance.toFixed(2)
                    : "0"}
                </Text>
                <Text style={styles.progressTarget}>
                  / {userGoal.target_value.toLocaleString()}{" "}
                  {userGoal.target_unit}
                </Text>
              </View>

              <Progress
                value={getProgressPercentage()}
                style={styles.progressBar}
              />

              <View style={styles.statusContainer}>
                <Text style={styles.progressPercentText}>
                  {getProgressPercentage()}% complete
                </Text>
                {getStatusBadge()}
              </View>
            </View>
          )}
        </CardContent>
      </StyledCard>

      {/* Active Rewards Card */}
      <StyledCard withShadow style={styles.rewardsCard}>
        <CardHeader>
          <View style={styles.rewardsHeader}>
            <MaterialCommunityIcons
              name="trophy"
              size={20}
              color="#10B981"
              style={styles.rewardsIcon}
            />
            <Text style={styles.rewardsTitle}>Active Rewards</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.activeRewardBadge}>
            <View style={styles.activeRewardDot} />
            <Text style={styles.activeRewardText}>Streak Saver is ACTIVE</Text>
          </View>
        </CardContent>
      </StyledCard>

      {/* Sign Out Button */}
      <StyledCard withShadow style={styles.signOutCard}>
        <CardContent>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </CardContent>
      </StyledCard>

      {/* Bottom padding for navigation */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    marginRight: 8,
  },
  statText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  goalCard: {
    marginBottom: 16,
  },
  goalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalIcon: {
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  refreshText: {
    fontSize: 12,
    color: "#7C3AED", // purple-700
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#64748B", // slate-500
  },
  noGoalContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noGoalText: {
    marginBottom: 16,
    color: "#64748B", // slate-500
  },
  setGoalButton: {
    width: "100%",
  },
  goalContent: {
    paddingVertical: 8,
  },
  goalDescription: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155", // slate-700
    marginBottom: 16,
  },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7C3AED", // purple-700
  },
  progressTarget: {
    fontSize: 18,
    color: "#64748B", // slate-500
    marginLeft: 4,
    paddingBottom: 4,
  },
  progressBar: {
    marginBottom: 12,
    height: 12,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentText: {
    fontSize: 14,
    color: "#64748B", // slate-500
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardsCard: {
    marginBottom: 16,
  },
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardsIcon: {
    marginRight: 8,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  activeRewardBadge: {
    backgroundColor: "#ECFDF5", // green-50
    borderWidth: 1,
    borderColor: "#A7F3D0", // green-200
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activeRewardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981", // green-500
    marginRight: 8,
  },
  activeRewardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#065F46", // green-800
  },
  signOutCard: {
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: "#EF4444", // red-500
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  bottomPadding: {
    height: 80,
  },
});
