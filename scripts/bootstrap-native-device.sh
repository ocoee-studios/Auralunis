#!/usr/bin/env bash
set -euo pipefail

echo "Chronaura native-device bootstrap"
echo "1/8 Installing JavaScript dependencies..."
npm install

echo "2/8 Aligning Expo SDK dependency versions..."
npx expo install --fix

echo "3/8 Installing Expo development client..."
npx expo install expo-dev-client

echo "4/8 Installing Expo Crypto..."
npx expo install expo-crypto

echo "5/8 Installing RevenueCat React Native SDK..."
npm install --save react-native-purchases

echo "6/8 Running Expo Doctor..."
npx expo-doctor

echo "7/8 Running Chronaura QA suites..."
npm run qa:all

echo "8/8 Native-device package is ready."
echo ""
echo "Next commands:"
echo "  npx eas-cli@latest login"
echo "  npx eas-cli@latest build --platform ios --profile development"
echo ""
echo "After installing the development build on the iPhone:"
echo "  npm run start:dev-client"
