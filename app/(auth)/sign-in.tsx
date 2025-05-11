import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text, PaperProvider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext"; // Adjusted path

/**
 * `SignInScreen` provides a UI for users to sign in.
 * It uses email and password for authentication.
 * @returns {JSX.Element} The sign-in screen component.
 */
export default function SignInScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  /**
   * Handles the sign-in process when the form is submitted.
   * Validates inputs and calls the signInWithEmail function from AuthContext.
   */
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Input Error", "Email and password cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      // The AuthContext and root layout will handle navigation upon successful sign-in.
      // router.replace("/(tabs)/dashboard"); // Example of direct navigation if needed
    } catch (error: any) {
      Alert.alert(
        "Sign In Failed",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Sign In
        </Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isLoading}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          disabled={isLoading}
        />
        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
        <Link href="/(auth)/sign-up" style={styles.link}>
          <Text>Don't have an account? Sign Up</Text>
        </Link>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
  },
});
