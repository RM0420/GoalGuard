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
import { fetchUserInventory } from "../../src/api/inventoryApi";
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

    setIsUsingItem(item.id);
    console.log(
      `Attempting to use item: ${item.title} (ID: ${item.id}, Type: ${item.reward_type})`
    );

    // TODO: Implement actual item usage logic
    // This would involve:
    // 1. Calling a Supabase RPC function (e.g., `use_reward_item`)
    //    - This RPC would decrement the quantity in `user_owned_rewards` (or delete if quantity becomes 0).
    //    - It would also apply the reward's effect (e.g., update a goal, set a flag on user_profile_and_stats).
    // 2. After the RPC call, refresh the inventory and user profile (if effects change it, e.g. streak saver flag).

    // For now, simulate an API call and then refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));

    Alert.alert(
      "Item Used (Simulated)",
      `${item.title} would have been used. Implement actual logic in handleUseItem.`
    );
    console.log("Simulated item usage complete. Actual implementation needed.");

    // Placeholder: In a real scenario, you might call a function like:
    // const result = await useInventoryItemApi(user.id, item.id, item.reward_type);
    // if (result.success) { ... refresh data ... }
    // else { Alert.alert("Error", result.message); }

    setIsUsingItem(null);
    await loadInventory(); // Refresh inventory list
    // Potentially refresh other contexts if item usage affects them, e.g., UserProfileContext for streak savers
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
