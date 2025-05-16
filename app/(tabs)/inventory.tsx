import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Appbar,
  Title,
  Paragraph,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";
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

// Helper function to map reward type to display properties
const getRewardDisplayProperties = (rewardType: ActiveRewardType) => {
  switch (rewardType) {
    case "skip_day":
      return {
        title: "Skip Day",
        description: "Skip a day's goal without breaking your streak.",
        cost: REWARD_COST_SKIP_DAY, // For reference, though already paid
      };
    case "streak_saver":
      return {
        title: "Streak Saver",
        description: "Maintain your streak despite a missed goal.",
        cost: REWARD_COST_STREAK_SAVER,
      };
    case "goal_reduction":
      return {
        title: "Goal Reduction",
        description: "Temporarily lower your daily goal target.",
        cost: REWARD_COST_GOAL_REDUCTION,
      };
    default:
      return {
        title: "Unknown Reward",
        description: "Details for this reward are not available.",
        cost: 0,
      };
  }
};

/**
 * `InventoryScreen` displays the rewards owned by the user.
 * @returns {JSX.Element}
 */
export default function InventoryScreen() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<MappedUserOwnedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingItem, setIsUsingItem] = useState<string | null>(null); // Stores ID of item being used
  const [refreshing, setRefreshing] = useState(false);

  // Ensure local ActiveRewardType (from src/types/inventory.types) is compatible
  // or use ApiActiveRewardType directly if suitable for getRewardDisplayProperties.
  // For now, we assume MappedUserOwnedReward.reward_type can be cast to ApiActiveRewardType for valid items.

  const loadInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await fetchUserInventory();
    if (response.success && response.data) {
      const mappedData = response.data.map((item) => ({
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading your inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="My Inventory" titleStyle={styles.appBarTitle} />
      </Appbar.Header>
      {inventory.length === 0 ? (
        <View style={styles.centeredMessageContainer}>
          <Title style={styles.emptyTitle}>Your Inventory is Empty</Title>
          <Paragraph style={styles.emptyParagraph}>
            Visit the Rewards Store to purchase items and enhance your
            goal-achieving journey!
          </Paragraph>
        </View>
      ) : (
        <FlatList
          data={inventory}
          renderItem={({ item }) => (
            <InventoryItemCard
              item={item}
              onUseItem={handleUseItem}
              isUsingItem={isUsingItem === item.id}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background for the whole screen
  },
  appBar: {
    backgroundColor: "#6200ee", // Standard Paper theme primary color
  },
  appBarTitle: {
    color: "#ffffff",
    fontWeight: "bold",
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
    color: "#555",
  },
  listContentContainer: {
    paddingVertical: 8,
  },
});
