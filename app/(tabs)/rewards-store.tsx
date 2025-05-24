import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  ActivityIndicator,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  REWARD_COST_SKIP_DAY,
  REWARD_COST_STREAK_SAVER,
  REWARD_COST_GOAL_REDUCTION,
} from "../../src/constants/gamification";
import { callPurchaseRewardRPC } from "../../src/api/transactionsApi";
import {
  StyledCard,
  CardContent,
} from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import StyledHeader from "../../src/components/common/StyledHeader";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "../../src/constants/theme";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  gradientColors: [string, string];
}

/**
 * `RewardsStoreScreen` allows users to purchase items using their earned coins.
 * @returns {JSX.Element}
 */
export default function RewardsStoreScreen() {
  const { user } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const theme = useTheme<AppTheme>();

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
      icon: "calendar",
      gradientColors: [theme.colors.warning500, theme.colors.warning600] as [
        string,
        string
      ],
    },
    {
      id: "streak_saver",
      title: "Streak Saver",
      description: "Maintain your streak despite a missed goal.",
      cost: REWARD_COST_STREAK_SAVER,
      icon: "shield",
      gradientColors: [theme.colors.success500, theme.colors.success600] as [
        string,
        string
      ],
    },
    {
      id: "goal_reduction",
      title: "Goal Reduction",
      description: "Temporarily lower your daily goal target.",
      cost: REWARD_COST_GOAL_REDUCTION,
      icon: "target",
      gradientColors: [theme.colors.purple500, theme.colors.purple600] as [
        string,
        string
      ],
    },
  ];

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
        <Text style={{ marginTop: 16 }}>Loading your coins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StyledHeader title="Store" />

      <LinearGradient
        colors={
          [theme.colors.purple50, theme.colors.customBackground] as [
            string,
            string
          ]
        }
        style={styles.gradientBackground}
      >
        {/* Coin Balance Card */}
        <LinearGradient
          colors={
            [theme.colors.purple700, theme.colors.purple900] as [string, string]
          }
          style={styles.coinBalanceCard}
        >
          <View style={styles.coinBalanceContent}>
            <IconButton
              icon="coins"
              iconColor="#FFD700"
              size={32}
              style={styles.coinIcon}
            />
            <View>
              <Text style={styles.coinBalanceLabel}>Your Coins</Text>
              <Text style={styles.coinBalanceValue}>
                {profile?.coin_balance ?? 0}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Rewards List */}
        <ScrollView contentContainerStyle={styles.rewardsContainer}>
          {rewards.map((reward, index) => (
            <StyledCard
              key={reward.id}
              style={{
                ...styles.rewardCard,
                marginTop: index > 0 ? 16 : 0,
              }}
              withShadow
            >
              <View style={styles.rewardCardContent}>
                {/* Icon Section */}
                <LinearGradient
                  colors={reward.gradientColors}
                  style={styles.rewardIconContainer}
                >
                  <IconButton
                    icon={reward.icon}
                    iconColor="white"
                    size={28}
                    style={styles.rewardIcon}
                  />
                </LinearGradient>

                {/* Content Section */}
                <CardContent style={styles.rewardDetails}>
                  <View style={styles.rewardHeader}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>
                      {reward.description}
                    </Text>
                  </View>

                  <View style={styles.purchaseSection}>
                    <View style={styles.costContainer}>
                      <Text style={styles.costText}>
                        Cost: {reward.cost} coins
                      </Text>
                    </View>

                    <StyledButton
                      variant="default"
                      size="sm"
                      onPress={() => handlePurchase(reward)}
                      disabled={
                        (profile?.coin_balance ?? 0) < reward.cost ||
                        isPurchasing === reward.id
                      }
                      loading={isPurchasing === reward.id}
                    >
                      {isPurchasing === reward.id
                        ? "Purchasing..."
                        : "Purchase"}
                    </StyledButton>
                  </View>
                </CardContent>
              </View>
            </StyledCard>
          ))}
        </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  subtitle: {
    textAlign: "center",
    marginVertical: 16,
    color: "#64748b",
    fontSize: 16,
  },
  coinBalanceCard: {
    borderRadius: 12,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  coinBalanceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  coinIcon: {
    margin: 0,
    marginRight: 12,
  },
  coinBalanceLabel: {
    color: "#e2e8f0",
    fontSize: 14,
  },
  coinBalanceValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  rewardsContainer: {
    paddingBottom: 20,
  },
  rewardCard: {
    overflow: "hidden",
    borderRadius: 12,
    elevation: 3,
  },
  rewardCardContent: {
    flexDirection: "row",
  },
  rewardIconContainer: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardIcon: {
    margin: 0,
  },
  rewardDetails: {
    flex: 1,
    paddingVertical: 16,
  },
  rewardHeader: {
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  purchaseSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  costText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
});
