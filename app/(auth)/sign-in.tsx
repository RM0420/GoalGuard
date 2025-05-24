import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Text, PaperProvider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import StyledButton from "../../src/components/common/StyledButton";
import { AppTheme } from "../../src/constants/theme";

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
          Welcome Back
        </Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to your GoalGuard account
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

        <StyledButton
          variant="default"
          size="lg"
          onPress={handleSignIn}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </StyledButton>

        <Link href="/(auth)/sign-up" style={styles.link}>
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.linkHighlight}>Sign Up</Text>
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
