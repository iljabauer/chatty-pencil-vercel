import Foundation
import Capacitor
import UIKit
import PencilKit

// MARK: - PencilInteractionManagerDelegate Protocol
@available(iOS 12.1, *)
public protocol PencilInteractionManagerDelegate: AnyObject {
    func pencilInteractionDidRequestToggle()
}

// MARK: - PencilInteractionManager
@available(iOS 12.1, *)
public class PencilInteractionManager: NSObject {
    
    // MARK: - Singleton
    public static let shared = PencilInteractionManager()
    
    // MARK: - Properties
    public weak var delegate: PencilInteractionManagerDelegate?
    private var interaction: UIPencilInteraction?
    
    // MARK: - Initialization
    private override init() {
        super.init()
    }
    
    // MARK: - Public Methods
    
    /// Sets up pencil interaction on the provided view
    /// - Parameter view: The view to register pencil interaction on
    public func setupInteraction(on view: UIView) {
        // Remove existing interaction if any
        if let existingInteraction = interaction {
            view.removeInteraction(existingInteraction)
        }
        
        // Create new pencil interaction
        let pencilInteraction = UIPencilInteraction()
        pencilInteraction.delegate = self
        view.addInteraction(pencilInteraction)
        self.interaction = pencilInteraction
    }
}

// MARK: - UIPencilInteractionDelegate
@available(iOS 12.1, *)
extension PencilInteractionManager: UIPencilInteractionDelegate {
    
    public func pencilInteractionDidTap(_ interaction: UIPencilInteraction) {
        // Always toggle canvas regardless of preferredTapAction
        // since our toggle action is app-specific, not tool-switching
        delegate?.pencilInteractionDidRequestToggle()
    }
}

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
    private var isCanvasOpen: Bool = false
    private var isPencilInitiated: Bool = false
    
    // MARK: - Plugin Lifecycle
    
    public override func load() {
        super.load()
        setupPencilInteraction()
    }
    
    private func setupPencilInteraction() {
        // Only setup pencil interaction if available
        if #available(iOS 12.1, *) {
            DispatchQueue.main.async {
                guard let webView = self.bridge?.webView else {
                    return
                }
                
                PencilInteractionManager.shared.setupInteraction(on: webView)
                PencilInteractionManager.shared.delegate = self
            }
        }
    }

    @objc func openCanvas(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.currentCall = call
            self.isPencilInitiated = false // This is a button-initiated open
            
            let backgroundColor = call.getString("backgroundColor") ?? "white"
            let presentationStyle = call.getString("presentationStyle") ?? "sheet"
            let showGrabber = call.getBool("showGrabber") ?? true
            let allowMediumDetent = call.getBool("allowMediumDetent") ?? false
            
            self.presentCanvas(
                backgroundColor: backgroundColor,
                presentationStyle: presentationStyle,
                showGrabber: showGrabber,
                allowMediumDetent: allowMediumDetent,
                onError: { call.reject("Unable to access view controller") }
            )
        }
    }
    
    private func presentCanvas(
        backgroundColor: String,
        presentationStyle: String,
        showGrabber: Bool,
        allowMediumDetent: Bool,
        onError: @escaping () -> Void
    ) {
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
            onError()
            return
        }
        
        viewController.present(canvasVC, animated: true) {
            self.isCanvasOpen = true
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
    
    // MARK: - Internal Methods for Pencil Interaction
    
    private func openCanvasFromPencilTap() {
        DispatchQueue.main.async {
            // Mark this as pencil-initiated so we can handle the result differently
            self.isPencilInitiated = true
            
            // Use default configuration for pencil-initiated opens (same as button defaults)
            self.presentCanvas(
                backgroundColor: "white",
                presentationStyle: "sheet",
                showGrabber: true,
                allowMediumDetent: false,
                onError: { /* Silently fail for pencil tap */ }
            )
        }
    }
    
    private func minimizeCanvasFromPencilTap() {
        DispatchQueue.main.async {
            guard let canvasVC = self.canvasViewController else {
                return
            }
            
            // Trigger the minimize action programmatically
            canvasVC.minimizeFromPencilTap()
        }
    }
}

// MARK: - PencilInteractionManagerDelegate
@available(iOS 12.1, *)
extension CanvasPlugin: PencilInteractionManagerDelegate {
    public func pencilInteractionDidRequestToggle() {
        if isCanvasOpen {
            minimizeCanvasFromPencilTap()
        } else {
            openCanvasFromPencilTap()
        }
    }
}

// MARK: - CanvasViewControllerDelegate
extension CanvasPlugin: CanvasViewControllerDelegate {
    func canvasDidSubmit(imageData: String) {
        isCanvasOpen = false
        
        if isPencilInitiated {
            // For pencil-initiated canvas, send an event to notify the web layer
            notifyListeners("canvasSubmitted", data: [
                "action": "submitted",
                "imageData": imageData,
                "hasContent": false
            ])
            isPencilInitiated = false
        } else {
            // For button-initiated canvas, resolve the call as usual
            currentCall?.resolve([
                "action": "submitted",
                "imageData": imageData,
                "hasContent": false
            ])
            currentCall = nil
        }
        
        canvasViewController = nil
    }
    
    func canvasDidMinimize(hasContent: Bool) {
        isCanvasOpen = false
        
        if isPencilInitiated {
            // For pencil-initiated canvas, send an event to notify the web layer
            notifyListeners("canvasMinimized", data: [
                "action": "minimized",
                "hasContent": hasContent
            ])
            isPencilInitiated = false
        } else {
            // For button-initiated canvas, resolve the call as usual
            currentCall?.resolve([
                "action": "minimized",
                "hasContent": hasContent
            ])
            currentCall = nil
        }
        
        canvasViewController = nil
    }
    
    func canvasDidCancel() {
        isCanvasOpen = false
        
        if isPencilInitiated {
            // For pencil-initiated canvas, send an event to notify the web layer
            notifyListeners("canvasCancelled", data: [
                "action": "cancelled",
                "hasContent": implementation.hasContent()
            ])
            isPencilInitiated = false
        } else {
            // For button-initiated canvas, resolve the call as usual
            currentCall?.resolve([
                "action": "cancelled",
                "hasContent": implementation.hasContent()
            ])
            currentCall = nil
        }
        
        canvasViewController = nil
    }
}
