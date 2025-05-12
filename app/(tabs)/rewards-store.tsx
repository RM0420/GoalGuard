import React from "react";
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
import {
  REWARD_COST_SKIP_DAY,
  REWARD_COST_STREAK_SAVER,
  REWARD_COST_GOAL_REDUCTION,
} from "../../src/constants/gamification";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  onPurchase: () => void; // Placeholder for purchase action
}

/**
 * `RewardsStoreScreen` - Placeholder for the rewards store.
 * @returns {JSX.Element}
 */
export default function RewardsStoreScreen() {
  const { profile, loadingProfile } = useUserProfile();

  // Define rewards
  const rewards: RewardItem[] = [
    {
      id: "skip_day",
      title: "Skip Day",
      description: "Skip a day's goal without breaking your streak.",
      cost: REWARD_COST_SKIP_DAY,
      onPurchase: () =>
        Alert.alert("Purchase: Skip Day", "Not implemented yet."),
    },
    {
      id: "streak_saver",
      title: "Streak Saver",
      description: "Maintain your streak despite a missed goal.",
      cost: REWARD_COST_STREAK_SAVER,
      onPurchase: () =>
        Alert.alert("Purchase: Streak Saver", "Not implemented yet."),
    },
    {
      id: "goal_reduction",
      title: "Goal Reduction",
      description: "Temporarily lower your daily goal target.",
      cost: REWARD_COST_GOAL_REDUCTION,
      onPurchase: () =>
        Alert.alert("Purchase: Goal Reduction", "Not implemented yet."),
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
                onPress={reward.onPurchase}
                disabled={(profile?.coin_balance ?? 0) < reward.cost}
              >
                Purchase
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
    color: "#6200ee", // Theme primary color (adjust if needed)
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
