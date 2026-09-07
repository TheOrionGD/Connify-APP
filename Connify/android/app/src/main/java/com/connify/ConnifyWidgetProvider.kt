package com.connify

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import org.json.JSONObject

class ConnifyWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            updateAppWidget(context, appWidgetManager, appWidgetId, options)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        updateAppWidget(context, appWidgetManager, appWidgetId, newOptions)
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
            options: Bundle?
        ) {
            val prefs = context.getSharedPreferences(WidgetBridgeModule.PREFS_NAME, Context.MODE_PRIVATE)
            constData(prefs.getString(WidgetBridgeModule.KEY_WIDGET_DATA, null))

            val rawWidth = options?.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH) ?: 0
            val rawHeight = options?.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT) ?: 0
            val width = if (rawWidth > 0) rawWidth else 200
            val height = if (rawHeight > 0) rawHeight else 110

            // Determine layout size
            val layoutId = when {
                width < 180 -> R.layout.connify_widget_small
                width >= 240 && height >= 200 -> R.layout.connify_widget_large
                else -> R.layout.connify_widget_medium
            }

            val views = RemoteViews(context.packageName, layoutId)

            // Read state from JSON
            var isAuthenticated = false
            var isOnline = true
            var protectionStatus = "UNAUTHENTICATED"
            var statusText = "Sign in Required"
            var nearbyHelpersCount = 0

            val rawJson = prefs.getString(WidgetBridgeModule.KEY_WIDGET_DATA, null)
            if (!rawJson.isNullOrEmpty()) {
                try {
                    val json = JSONObject(rawJson)
                    isAuthenticated = json.optBoolean("isAuthenticated", false)
                    isOnline = json.optBoolean("isOnline", true)
                    protectionStatus = json.optString("protectionStatus", "UNAUTHENTICATED")
                    statusText = json.optString("statusText", "Sign in Required")
                    nearbyHelpersCount = json.optInt("nearbyHelpersCount", 0)
                } catch (e: Exception) {
                    // fallback to defaults
                }
            }

            // Bind values to UI elements based on layout
            when (layoutId) {
                R.layout.connify_widget_small -> {
                    views.setTextViewText(R.id.widget_small_status, if (isAuthenticated) (if (isOnline) "Ready" else "Offline") else "Sign in")
                    setupPendingIntent(context, views, R.id.btn_small_sos, "connify://sos")
                }
                R.layout.connify_widget_medium -> {
                    val subText = if (!isAuthenticated) {
                        "Sign in to Connify Safety"
                    } else if (!isOnline) {
                        "● Offline Mode (SMS Active)"
                    } else {
                        "Quick emergency access"
                    }
                    views.setTextViewText(R.id.widget_medium_subtitle, subText)
                    setupPendingIntent(context, views, R.id.btn_medium_sos, "connify://sos")
                    setupPendingIntent(context, views, R.id.btn_medium_help, "connify://nearby-help")
                }
                R.layout.connify_widget_large -> {
                    val statusFormatted = when (protectionStatus) {
                        "READY" -> "● Protection Ready"
                        "OFFLINE" -> "● Offline Mode"
                        "ACTIVE_EPISODE" -> "● Active Emergency Episode"
                        "UNAUTHENTICATED" -> "● Sign in Required"
                        else -> "● Protection Status: $statusText"
                    }
                    val footerFormatted = if (!isOnline) {
                        "Offline Mode: Cellular SMS active"
                    } else if (!isAuthenticated) {
                        "Open app to authenticate"
                    } else {
                        "Nearby helpers: $nearbyHelpersCount"
                    }

                    views.setTextViewText(R.id.widget_large_status, statusFormatted)
                    views.setTextViewText(R.id.widget_large_footer, footerFormatted)

                    setupPendingIntent(context, views, R.id.btn_large_sos, "connify://sos")
                    setupPendingIntent(context, views, R.id.btn_large_help, "connify://nearby-help")
                    setupPendingIntent(context, views, R.id.btn_large_open, "connify://home")
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun constData(data: String?) {}

        private fun setupPendingIntent(
            context: Context,
            views: RemoteViews,
            viewId: Int,
            deepLinkUrl: String
        ) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUrl)).apply {
                setPackage(context.packageName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                deepLinkUrl.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(viewId, pendingIntent)
        }
    }
}
