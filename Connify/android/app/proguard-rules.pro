# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in proguard-android-optimize.txt.

# ----------------------------------------------------
# React Native & Hermes Core
# ----------------------------------------------------
# Keep only necessary RN reflection / JNI entrypoints rather than locking the entire package
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }

# Keep reflection targets used by RN TurboModules / Fabric / JNI
-keepclassmembers class * {
    native <methods>;
}
-keepclasseswithmembernames class * {
    native <methods>;
}

# ----------------------------------------------------
# Reanimated, Worklets & Gesture Handler
# ----------------------------------------------------
-keepclassmembers class com.swmansion.reanimated.** { *; }
-keepclassmembers class com.swmansion.rnscreens.** { *; }

# ----------------------------------------------------
# Firebase & Google Services
# ----------------------------------------------------
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ----------------------------------------------------
# Camera, ML Kit & Vision
# ----------------------------------------------------
-keep class com.google.mlkit.** { *; }

# ----------------------------------------------------
# WebRTC, Video & Networking
# ----------------------------------------------------
-dontwarn okhttp3.**
-dontwarn okio.**

# ----------------------------------------------------
# Keychain, Biometrics, Async Storage & Localization
# ----------------------------------------------------
-keep class com.rnbiometrics.** { *; }
-keep class com.zoontek.rnbootsplash.** { *; }

# ----------------------------------------------------
# Nitro Modules
# ----------------------------------------------------
-keep class com.margelo.nitro.** { *; }

# ----------------------------------------------------
# Connify Safety Widget & Native Modules
# ----------------------------------------------------
-keep class com.connify.ConnifyWidgetProvider { *; }
-keep class com.connify.WidgetBridgeModule { *; }

# ----------------------------------------------------
# Optimization & Obfuscation Flags
# ----------------------------------------------------
-repackageclasses
-allowaccessmodification
-dontwarn javax.annotation.**
-dontwarn org.checkerframework.**
