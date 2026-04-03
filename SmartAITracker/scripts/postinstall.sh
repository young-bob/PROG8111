#!/bin/bash
# Patch @react-native-voice/voice build.gradle to fix jcenter() and compileSdk issues
VOICE_GRADLE="node_modules/@react-native-voice/voice/android/build.gradle"
if [ -f "$VOICE_GRADLE" ]; then
  sed -i '' 's/jcenter()/mavenCentral()/g' "$VOICE_GRADLE"
  sed -i '' 's/compileSdkVersion 28/compileSdkVersion 34/g' "$VOICE_GRADLE"
  sed -i '' 's/targetSdkVersion 28/targetSdkVersion 34/g' "$VOICE_GRADLE"
  sed -i '' 's/buildToolsVersion "28.0.3"/buildToolsVersion "34.0.0"/g' "$VOICE_GRADLE"
  echo "✅ Patched @react-native-voice/voice build.gradle"
fi
