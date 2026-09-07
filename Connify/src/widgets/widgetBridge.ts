import { NativeModules } from 'react-native';
import { WidgetData, DEFAULT_WIDGET_DATA } from './widgetTypes';

const { ConnifyWidgetBridge } = NativeModules;

export class WidgetBridgeService {
  /**
   * Serializes widget state and pushes to native platform storage (SharedPreferences / UserDefaults)
   * and triggers OS-level widget timeline refresh.
   */
  public static async updateWidgetState(data: Partial<WidgetData>): Promise<boolean> {
    const fullData: WidgetData = {
      ...DEFAULT_WIDGET_DATA,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(fullData);

    try {
      if (ConnifyWidgetBridge && typeof ConnifyWidgetBridge.updateWidgetState === 'function') {
        await ConnifyWidgetBridge.updateWidgetState(jsonString);
        return true;
      } else {
        if (__DEV__) {
          console.log('[WidgetBridgeService] Native module not available yet (mock update):', fullData.protectionStatus);
        }
        return false;
      }
    } catch (error) {
      console.warn('[WidgetBridgeService] Error updating widget state:', error);
      return false;
    }
  }

  /**
   * Retrieves the currently persisted widget state from native storage.
   */
  public static async getWidgetState(): Promise<WidgetData> {
    try {
      if (ConnifyWidgetBridge && typeof ConnifyWidgetBridge.getWidgetState === 'function') {
        const jsonString = await ConnifyWidgetBridge.getWidgetState();
        if (jsonString) {
          return { ...DEFAULT_WIDGET_DATA, ...JSON.parse(jsonString) };
        }
      }
    } catch (error) {
      console.warn('[WidgetBridgeService] Error getting widget state:', error);
    }
    return DEFAULT_WIDGET_DATA;
  }
}
