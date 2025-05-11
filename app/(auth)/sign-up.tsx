import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text, PaperProvider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext"; // Adjusted path

/**
 * `SignUpScreen` provides a UI for new users to create an account.
 * It uses email and password for registration.
 * @returns {JSX.Element} The sign-up screen component.
 */
export default function SignUpScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  /**
   * Handles the sign-up process when the form is submitted.
   * Validates inputs, checks for password match, and calls the signUpWithEmail function.
   */
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Input Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      // On successful sign-up, Supabase usually sends a confirmation email.
      // You might want to navigate to a screen informing the user to check their email.
      Alert.alert(
        "Sign Up Successful",
        "Please check your email to confirm your account."
      );
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      Alert.alert(
        "Sign Up Failed",
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
          Sign Up
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
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          disabled={isLoading}
        />
        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign Up
        </Button>
        <Link href="/(auth)/sign-in" style={styles.link}>
          <Text>Already have an account? Sign In</Text>
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
