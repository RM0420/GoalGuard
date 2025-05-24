import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Text, ActivityIndicator, Badge, useTheme } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  fetchUserInventory,
  useInventoryItem,
  UseRewardPayload,
  ActiveRewardType as ApiActiveRewardType,
} from "../../src/api/inventoryApi";
import {
  UserOwnedReward,
  MappedUserOwnedReward,
  ActiveRewardType,
} from "../../src/types/inventory.types";
import InventoryItemCard from "../../src/components/inventory/InventoryItemCard";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  REWARD_COST_SKIP_DAY,
  REWARD_COST_STREAK_SAVER,
  REWARD_COST_GOAL_REDUCTION,
} from "../../src/constants/gamification";
import StyledHeader from "../../src/components/common/StyledHeader";
import type { AppTheme } from "../../src/constants/theme";

// Helper function to map reward type to display properties
const getRewardDisplayProperties = (rewardType: ActiveRewardType) => {
  switch (rewardType) {
    case "skip_day":
      return {
        title: "Skip Day",
        description: "Skip a day's goal without breaking your streak.",
        cost: REWARD_COST_SKIP_DAY, // For reference, though already paid
        icon: "calendar-blank",
        color: "warning" as const, // Maps to our theme colors
      };
    case "streak_saver":
      return {
        title: "Streak Saver",
        description: "Maintain your streak despite a missed goal.",
        cost: REWARD_COST_STREAK_SAVER,
        icon: "shield-outline",
        color: "success" as const, // Maps to our theme colors
      };
    case "goal_reduction":
      return {
        title: "Goal Reduction",
        description: "Temporarily lower your daily goal target.",
        cost: REWARD_COST_GOAL_REDUCTION,
        icon: "target",
        color: "primary" as const, // Maps to our theme colors
      };
    default:
      return {
        title: "Unknown Reward",
        description: "Details for this reward are not available.",
        cost: 0,
        icon: "help-circle-outline",
        color: "muted" as const, // Maps to our theme colors
      };
  }
};

/**
 * `InventoryScreen` displays the rewards owned by the user.
 * @returns {JSX.Element}
 */
export default function InventoryScreen() {
  const { user } = useAuth();
  const theme = useTheme<AppTheme>();
  const [inventory, setInventory] = useState<MappedUserOwnedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingItem, setIsUsingItem] = useState<string | null>(null); // Stores ID of item being used
  const [refreshing, setRefreshing] = useState(false);

  const loadInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await fetchUserInventory();
    if (response.success && response.data) {
      // Map the API response to include our display properties
      const mappedData: MappedUserOwnedReward[] = response.data.map((item) => ({
        ...item,
        ...getRewardDisplayProperties(item.reward_type),
      }));
      setInventory(mappedData);
    } else {
      Alert.alert("Error", response.error || "Could not load your inventory.");
      setInventory([]); // Clear inventory on error
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  }, [loadInventory]);

  const handleUseItem = async (item: MappedUserOwnedReward) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to use items.");
      return;
    }

    // Cast to the API's expected type for active rewards.
    // This also implicitly filters out trying to "use" a streak_saver here.
    const rewardTypeApi = item.reward_type as ApiActiveRewardType;

    if (rewardTypeApi !== "skip_day" && rewardTypeApi !== "goal_reduction") {
      Alert.alert(
        "Info",
        "This item works automatically or cannot be used directly."
      );
      setIsUsingItem(null);
      return;
    }

    setIsUsingItem(item.id);
    console.log(
      `Attempting to use item: ${item.title} (ID: ${item.id}, Type: ${rewardTypeApi})`
    );

    const payload: UseRewardPayload = {
      reward_type: rewardTypeApi,
    };

    const result = await useInventoryItem(payload);

    if (result.success) {
      Alert.alert(
        "Success",
        result.message || `${item.title} used successfully.`
      );
      await loadInventory(); // Refresh inventory list
      // TODO: Potentially refresh other global states/contexts if affected
      // e.g., UserProfileContext if coin balance/streak could change immediately
      // or if goal display on dashboard needs to update due to goal_reduction.
    } else {
      Alert.alert(
        "Error Using Item",
        result.error || "Could not use the item."
      );
    }

    setIsUsingItem(null);
  };

  return (
    <LinearGradient
      colors={[theme.colors.purple50, theme.colors.customBackground]}
      style={styles.container}
    >
      <StyledHeader title="Inventory" />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading your inventory...
          </Text>
        </View>
      ) : inventory.length === 0 ? (
        <View style={styles.centered}>
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurface }]}
            variant="bodyLarge"
          >
            You don't have any items in your inventory yet.
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              { color: theme.colors.customMutedForeground },
            ]}
            variant="bodyMedium"
          >
            Complete goals to earn coins and purchase rewards in the store.
          </Text>
        </View>
      ) : (
        <FlatList
          data={inventory}
          renderItem={({ item, index }) => (
            <InventoryItemCard
              item={item}
              onUseItem={handleUseItem}
              isUsingItem={isUsingItem === item.id}
              animationDelay={index * 100} // For staggered animation
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    textAlign: "center",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyParagraph: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  listContentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
