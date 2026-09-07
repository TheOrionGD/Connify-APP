package com.connify

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ConnifyWidgetBridge"

    companion object {
        const val PREFS_NAME = "connify_widget_prefs"
        const val KEY_WIDGET_DATA = "widget_data"
    }

    @ReactMethod
    fun updateWidgetState(jsonString: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_WIDGET_DATA, jsonString).apply()

            // Trigger broadcast update to all active Connify Safety widgets
            val intent = Intent(reactContext, ConnifyWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                val ids = AppWidgetManager.getInstance(reactContext)
                    .getAppWidgetIds(ComponentName(reactContext, ConnifyWidgetProvider::class.java))
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            reactContext.sendBroadcast(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_UPDATE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getWidgetState(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val data = prefs.getString(KEY_WIDGET_DATA, "")
            promise.resolve(data)
        } catch (e: Exception) {
            promise.reject("WIDGET_READ_ERROR", e.message, e)
        }
    }
}
