# GoalGuard - Daily Goal Tracker App

GoalGuard is a mobile application designed to help users set and achieve daily physical goals, while motivating them through a gamified experience. If users don't complete their daily goal, pre-selected apps on their device will be blocked until the goal is met. Users earn rewards and virtual currency (coins) for meeting goals, building streaks, and tackling bonus challenges.

## Features

- **Daily Physical Goals**: Set personalized physical goals (steps, running distance)
- **Progress Tracking**: Monitor your progress through HealthKit integration
- **App Blocking**: Block selected apps until your goal is complete
- **Gamification**: Earn coins, build streaks, and redeem rewards
- **Automatic Goal Reset**: Goals are automatically checked at midnight and reset for the new day

## Tech Stack

- **Frontend**: React Native with TypeScript, Expo, Expo Router
- **UI Framework**: React Native Paper
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Data Tracking**: HealthKit API
- **App Blocking**: Screen Time API

## Automated Goal Check

GoalGuard features an automated system that runs at midnight each day to:

1. Evaluate users' goal progress for the previous day
2. Update streaks and award coins for completed goals
3. Automatically apply "Streak Saver" rewards if available
4. Create new progress entries for the current day

For more details on how this works, see [Automated Goal Check Documentation](docs/AUTOMATED_GOAL_CHECK.md).

## Getting Started

```sh
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Deployment

Deploy using Expo Application Services (EAS):

```sh
# Build for production
npx eas-cli build

# Submit to app stores
npx eas-cli submit
```

## Documentation

- [Project Requirements](docs/CONTEXT.MD)
- [Automated Goal Check](docs/AUTOMATED_GOAL_CHECK.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
