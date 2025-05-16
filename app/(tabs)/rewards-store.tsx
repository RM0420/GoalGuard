import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  Title,
  Paragraph,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  REWARD_COST_SKIP_DAY,
  REWARD_COST_STREAK_SAVER,
  REWARD_COST_GOAL_REDUCTION,
} from "../../src/constants/gamification";
import { callPurchaseRewardRPC } from "../../src/api/transactionsApi";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
}

/**
 * `RewardsStoreScreen` allows users to purchase items using their earned coins.
 * @returns {JSX.Element}
 */
export default function RewardsStoreScreen() {
  const { user } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const handlePurchase = async (reward: RewardItem) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to make a purchase.");
      console.log("Purchase attempt failed: No authenticated user");
      return;
    }
    if ((profile?.coin_balance ?? 0) < reward.cost) {
      Alert.alert("Error", "You do not have enough coins for this item.");
      console.log("Purchase attempt failed: Insufficient coins");
      return;
    }

    setIsPurchasing(reward.id);
    console.log(
      `Attempting to purchase ${reward.id} for ${reward.cost} coins...`
    );

    try {
      const rewardDescriptionForLog = `Purchased reward: ${reward.title}`;
      // Placeholder for reward-specific details, if any
      const rewardDetailsPayload = { reward_type: reward.id };

      console.log("Calling purchase_reward RPC with:", {
        user_id: user.id,
        reward_type: reward.id,
        coin_cost: reward.cost,
      });

      const result = await callPurchaseRewardRPC(
        user,
        reward.id, // reward.id is 'skip_day', 'streak_saver', etc.
        reward.cost,
        rewardDescriptionForLog,
        rewardDetailsPayload
      );

      console.log("RPC result:", result);

      if (result.success) {
        console.log(`Purchase successful! New balance: ${result.new_balance}`);
        Alert.alert(
          "Purchase Successful!",
          `${reward.title} has been added to your inventory. Your new balance is ${result.new_balance} coins.`
        );
        await refreshUserProfile(); // Refresh profile to show updated coin balance

        // Reward-specific effects are now handled when the item is used from the inventory
        // So, the switch statement below can be removed or commented out.
        /*
        switch (reward.id) {
          case "skip_day":
            console.log(
              "TODO: Implement 'Skip Day' logic - e.g., update current goal status to 'skipped'"
            );
            // This might involve calling a function from GoalsContext or goalsApi
            break;
          case "streak_saver":
            console.log(
              "TODO: Implement 'Streak Saver' logic - this might be a passive flag on the user profile or require specific logic on goal failure"
            );
            break;
          case "goal_reduction":
            console.log(
              "TODO: Implement 'Goal Reduction' logic - e.g., allow user to modify current goal's target to a lower value"
            );
            // This might involve updating the goal via GoalsContext or goalsApi
            break;
          default:
            break;
        }
        */
      } else {
        console.log(`Purchase failed: ${result.message}`);
        Alert.alert(
          "Purchase Failed",
          result.message || "Could not complete the purchase. Please try again."
        );
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Unexpected error during purchase:", error);
      Alert.alert(
        "Purchase Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setIsPurchasing(null);
    }
  };

  const rewards: RewardItem[] = [
    {
      id: "skip_day",
      title: "Skip Day",
      description: "Skip a day's goal without breaking your streak.",
      cost: REWARD_COST_SKIP_DAY,
    },
    {
      id: "streak_saver",
      title: "Streak Saver",
      description: "Maintain your streak despite a missed goal.",
      cost: REWARD_COST_STREAK_SAVER,
    },
    {
      id: "goal_reduction",
      title: "Goal Reduction",
      description: "Temporarily lower your daily goal target.",
      cost: REWARD_COST_GOAL_REDUCTION,
    },
  ];

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading your coins...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Title style={styles.storeTitle}>Rewards Store</Title>
          <View style={styles.coinBalanceContainer}>
            <Text variant="headlineSmall">Your Coins: </Text>
            <Text variant="headlineSmall" style={styles.coinText}>
              {profile?.coin_balance ?? 0}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {rewards.map((reward) => (
        <Card key={reward.id} style={styles.rewardCard}>
          <Card.Content>
            <Title>{reward.title}</Title>
            <Paragraph>{reward.description}</Paragraph>
            <Divider style={styles.divider} />
            <View style={styles.purchaseSection}>
              <Text variant="titleMedium">Cost: {reward.cost} coins</Text>
              <Button
                mode="contained"
                onPress={() => handlePurchase(reward)}
                disabled={
                  (profile?.coin_balance ?? 0) < reward.cost ||
                  isPurchasing === reward.id
                }
                loading={isPurchasing === reward.id}
              >
                {isPurchasing === reward.id ? "Purchasing..." : "Purchase"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    margin: 10,
    elevation: 2,
  },
  headerContent: {
    alignItems: "center",
  },
  storeTitle: {
    marginBottom: 10,
  },
  coinBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinText: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  rewardCard: {
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  divider: {
    marginVertical: 10,
  },
  purchaseSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
});
