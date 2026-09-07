import Foundation
import WidgetKit

@objc(ConnifyWidgetBridge)
class ConnifyWidgetBridge: NSObject {
  
  private let appGroupName = "group.com.connify.safety"
  private let widgetDataKey = "widget_data"

  @objc
  func updateWidgetState(_ jsonString: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupName) ?? UserDefaults.standard
    defaults.set(jsonString, forKey: widgetDataKey)
    defaults.synchronize()

    #if canImport(WidgetKit)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
    #endif

    resolve(true)
  }

  @objc
  func getWidgetState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: appGroupName) ?? UserDefaults.standard
    let jsonString = defaults.string(forKey: widgetDataKey) ?? ""
    resolve(jsonString)
  }
}
