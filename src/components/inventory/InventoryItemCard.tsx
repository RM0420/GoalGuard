import React, { useEffect } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { Text, Button, Badge, IconButton, useTheme } from "react-native-paper";
import { MappedUserOwnedReward } from "../../types/inventory.types";
import { LinearGradient } from "expo-linear-gradient";
import { StyledCard } from "../common/StyledCard";
import StyledButton from "../common/StyledButton";
import type { AppTheme } from "../../constants/theme";

/**
 * @interface InventoryItemCardProps
 * Props for the `InventoryItemCard` component.
 */
interface InventoryItemCardProps {
  item: MappedUserOwnedReward;
  onUseItem: (item: MappedUserOwnedReward) => void; // Callback when user wants to use the item
  isUsingItem: boolean; // To show loading state on the button
  animationDelay?: number; // Delay for fade-in animation
}

/**
 * `InventoryItemCard` component
 * Displays a single reward item from the user's inventory.
 * Allows the user to use the item.
 *
 * @param {InventoryItemCardProps} props - The component props.
 * @returns {JSX.Element}
 */
const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onUseItem,
  isUsingItem,
  animationDelay = 0,
}) => {
  const theme = useTheme<AppTheme>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Fade in animation with delay
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, animationDelay]);

  // Get gradient colors based on item color type
  const getGradientColors = (): [string, string] => {
    switch (item.color) {
      case "primary":
        return [theme.colors.purple500, theme.colors.purple600];
      case "success":
        return [theme.colors.success500, theme.colors.success600];
      case "warning":
        return [theme.colors.warning500, theme.colors.warning600];
      default:
        return [theme.colors.customMuted, theme.colors.customMutedForeground];
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <StyledCard style={styles.card} withShadow={true} withBorder={false}>
        <View style={styles.cardContent}>
          {/* Icon Section with Gradient Background */}
          <LinearGradient
            colors={getGradientColors()}
            style={styles.iconContainer}
          >
            <IconButton
              icon={item.icon || "package-variant"}
              iconColor="#fff"
              size={28}
            />
          </LinearGradient>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <Text variant="titleLarge" style={styles.title}>
                  {item.title}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.description,
                    { color: theme.colors.customMutedForeground },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.quantityText}>
                  <Text style={styles.quantityLabel}>Owned:</Text>{" "}
                  {item.quantity}
                </Text>
              </View>
            </View>

            <View style={styles.footerContainer}>
              <StyledButton
                variant="default"
                size="sm"
                onPress={() => onUseItem(item)}
                disabled={isUsingItem || item.quantity < 1}
                loading={isUsingItem}
                icon="play-circle-outline"
              >
                {isUsingItem ? "Using..." : "Use Item"}
              </StyledButton>
            </View>
          </View>
        </View>
      </StyledCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
  },
  iconContainer: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  quantityText: {
    fontSize: 12,
    color: "#18181b",
  },
  quantityLabel: {
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
});

export default InventoryItemCard;
