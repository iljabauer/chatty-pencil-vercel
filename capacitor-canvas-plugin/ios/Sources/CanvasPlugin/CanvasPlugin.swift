import Foundation
import Capacitor
import UIKit
import PencilKit

/**
 * Canvas plugin for handwriting input with Apple Pencil support
 */
@objc(CanvasPlugin)
public class CanvasPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CanvasPlugin"
    public let jsName = "Canvas"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openCanvas", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearCanvas", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hasContent", returnType: CAPPluginReturnPromise)
    ]
    
    private let implementation = Canvas()
    private var canvasViewController: CanvasViewController?
    private var currentCall: CAPPluginCall?

    @objc func openCanvas(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.currentCall = call
            
            let backgroundColor = call.getString("backgroundColor") ?? "white"
            let presentationStyle = call.getString("presentationStyle") ?? "sheet"
            let showGrabber = call.getBool("showGrabber") ?? true
            let allowMediumDetent = call.getBool("allowMediumDetent") ?? false
            
            // Create and present canvas view controller
            let canvasVC = CanvasViewController()
            canvasVC.delegate = self
            canvasVC.backgroundColor = backgroundColor
            
            // Configure presentation style
            switch presentationStyle {
            case "fullScreen":
                canvasVC.modalPresentationStyle = .fullScreen
            case "sheet":
                canvasVC.modalPresentationStyle = .pageSheet
                
                // Configure sheet presentation controller for iOS 15+
                if #available(iOS 15.0, *) {
                    if let sheet = canvasVC.sheetPresentationController {
                        // Set detents based on configuration
                        if allowMediumDetent {
                            sheet.detents = [.medium(), .large()]
                        } else {
                            sheet.detents = [.large()]
                        }
                        
                        sheet.prefersGrabberVisible = showGrabber
                        sheet.prefersScrollingExpandsWhenScrolledToEdge = false
                        sheet.prefersEdgeAttachedInCompactHeight = true
                        sheet.widthFollowsPreferredContentSizeWhenEdgeAttached = true
                    }
                }
            default:
                canvasVC.modalPresentationStyle = .pageSheet
            }
            
            self.canvasViewController = canvasVC
            
            guard let viewController = self.bridge?.viewController else {
                call.reject("Unable to access view controller")
                return
            }
            
            viewController.present(canvasVC, animated: true)
        }
    }
    
    @objc func clearCanvas(_ call: CAPPluginCall) {
        implementation.clearCanvas()
        call.resolve()
    }
    
    @objc func hasContent(_ call: CAPPluginCall) {
        let hasContent = implementation.hasContent()
        call.resolve([
            "hasContent": hasContent
        ])
    }
}

// MARK: - CanvasViewControllerDelegate
extension CanvasPlugin: CanvasViewControllerDelegate {
    func canvasDidSubmit(imageData: String) {
        currentCall?.resolve([
            "action": "submitted",
            "imageData": imageData,
            "hasContent": false
        ])
        currentCall = nil
        canvasViewController = nil
    }
    
    func canvasDidMinimize(hasContent: Bool) {
        currentCall?.resolve([
            "action": "minimized",
            "hasContent": hasContent
        ])
        currentCall = nil
        canvasViewController = nil
    }
    
    func canvasDidCancel() {
        currentCall?.resolve([
            "action": "cancelled",
            "hasContent": implementation.hasContent()
        ])
        currentCall = nil
        canvasViewController = nil
    }
}
