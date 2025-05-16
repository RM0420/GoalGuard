import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  Text,
  Button,
  Paragraph,
  Divider,
  Chip,
} from "react-native-paper";
import { MappedUserOwnedReward } from "../../types/inventory.types";

/**
 * @interface InventoryItemCardProps
 * Props for the `InventoryItemCard` component.
 */
interface InventoryItemCardProps {
  item: MappedUserOwnedReward;
  onUseItem: (item: MappedUserOwnedReward) => void; // Callback when user wants to use the item
  isUsingItem: boolean; // To show loading state on the button
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
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall" style={styles.title}>
            {item.title}
          </Text>
          <Chip
            icon="briefcase-outline"
            style={styles.quantityChip}
            textStyle={styles.quantityText}
          >
            Owned: {item.quantity}
          </Chip>
        </View>
        <Paragraph style={styles.description}>{item.description}</Paragraph>
        <Divider style={styles.divider} />
        <Text style={styles.acquiredDate}>
          Acquired: {new Date(item.acquired_at).toLocaleDateString()}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => onUseItem(item)}
          disabled={isUsingItem || item.quantity < 1} // Disable if no quantity or if already using
          loading={isUsingItem}
          icon="play-circle-outline"
        >
          {isUsingItem ? "Using..." : "Use Item"}
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4, // for Android shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    flexShrink: 1, // Prevents title from pushing chip off-screen
  },
  quantityChip: {
    marginLeft: 8,
  },
  quantityText: {
    fontSize: 14,
  },
  description: {
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    marginVertical: 12,
  },
  acquiredDate: {
    fontSize: 12,
    color: "gray",
    marginBottom: 8,
  },
  actionsContainer: {
    justifyContent: "flex-end",
    paddingRight: 16,
    paddingBottom: 16,
  },
});

export default InventoryItemCard;
