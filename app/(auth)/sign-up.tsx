import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Text, PaperProvider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import StyledButton from "../../src/components/common/StyledButton";
import { AppTheme } from "../../src/constants/theme";

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
    <PaperProvider theme={AppTheme}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text variant="headlineMedium" style={styles.title}>
          Create Account
        </Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Join GoalGuard and start achieving your goals
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isLoading}
          mode="outlined"
          outlineColor={AppTheme.colors.customBorder}
          activeOutlineColor={AppTheme.colors.purple700}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          disabled={isLoading}
          mode="outlined"
          outlineColor={AppTheme.colors.customBorder}
          activeOutlineColor={AppTheme.colors.purple700}
          right={
            <TextInput.Icon
              icon="eye"
              onPress={() => {}} // Toggle password visibility (to be implemented)
            />
          }
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          disabled={isLoading}
          mode="outlined"
          outlineColor={AppTheme.colors.customBorder}
          activeOutlineColor={AppTheme.colors.purple700}
          right={
            <TextInput.Icon
              icon="eye"
              onPress={() => {}} // Toggle password visibility (to be implemented)
            />
          }
        />

        <StyledButton
          variant="default"
          size="lg"
          onPress={handleSignUp}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign Up
        </StyledButton>

        <Link href="/(auth)/sign-in" style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkHighlight}>Sign In</Text>
          </Text>
        </Link>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: AppTheme.colors.background,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
    color: AppTheme.colors.onBackground,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: AppTheme.colors.customMutedForeground,
  },
  input: {
    marginBottom: 16,
    backgroundColor: AppTheme.colors.background,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  link: {
    alignSelf: "center",
  },
  linkText: {
    color: AppTheme.colors.customMutedForeground,
  },
  linkHighlight: {
    color: AppTheme.colors.purple700,
    fontWeight: "600",
  },
});
