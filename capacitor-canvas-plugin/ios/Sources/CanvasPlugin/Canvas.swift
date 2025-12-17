import Foundation
import UIKit
import PencilKit

@objc public class Canvas: NSObject {
    // Static property to preserve drawing state across minimize/reopen
    private static var preservedDrawing: PKDrawing?
    
    @objc public func clearCanvas() {
        Canvas.preservedDrawing = nil
    }
    
    @objc public func hasContent() -> Bool {
        guard let drawing = Canvas.preservedDrawing else {
            return false
        }
        return !drawing.strokes.isEmpty
    }
    
    @objc public func getPreservedDrawing() -> PKDrawing? {
        return Canvas.preservedDrawing
    }
    
    @objc public func setPreservedDrawing(_ drawing: PKDrawing?) {
        Canvas.preservedDrawing = drawing
    }
}

// MARK: - CanvasViewController
import UIKit
import PencilKit

protocol CanvasViewControllerDelegate: AnyObject {
    func canvasDidSubmit(imageData: String)
    func canvasDidMinimize(hasContent: Bool)
    func canvasDidCancel()
}

class CanvasViewController: UIViewController {
    
    private let canvasView = PKCanvasView()
    private var toolPicker: PKToolPicker?
    private let canvas = Canvas()
    
    weak var delegate: CanvasViewControllerDelegate?
    var backgroundColor: String = "white"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCanvas()
        setupToolbar()
        restoreDrawing()
        setupSheetDelegate()
    }
    
    private func setupSheetDelegate() {
        // Set up sheet presentation controller delegate for iOS 15+
        if #available(iOS 15.0, *) {
            if let sheet = sheetPresentationController {
                sheet.delegate = self
            }
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        setupToolPicker()
    }
    
    private func setupCanvas() {
        view.backgroundColor = UIColor.systemBackground
        
        canvasView.translatesAutoresizingMaskIntoConstraints = false
        canvasView.backgroundColor = backgroundColor == "white" ? UIColor.white : UIColor.systemBackground
        canvasView.isOpaque = false
        
        view.addSubview(canvasView)
        
        NSLayoutConstraint.activate([
            canvasView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 60),
            canvasView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            canvasView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            canvasView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    private func setupToolbar() {
        let toolbar = UIView()
        toolbar.backgroundColor = UIColor.systemBackground
        toolbar.translatesAutoresizingMaskIntoConstraints = false
        
        let submitButton = UIButton(type: .system)
        submitButton.setTitle("Submit", for: .normal)
        submitButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        submitButton.addTarget(self, action: #selector(submitTapped), for: .touchUpInside)
        
        let minimizeButton = UIButton(type: .system)
        minimizeButton.setTitle("Minimize", for: .normal)
        minimizeButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        minimizeButton.addTarget(self, action: #selector(minimizeTapped), for: .touchUpInside)
        
        let stackView = UIStackView(arrangedSubviews: [minimizeButton, submitButton])
        stackView.axis = .horizontal
        stackView.distribution = .equalSpacing
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        toolbar.addSubview(stackView)
        view.addSubview(toolbar)
        
        NSLayoutConstraint.activate([
            toolbar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            toolbar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            toolbar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            toolbar.heightAnchor.constraint(equalToConstant: 60),
            
            stackView.centerYAnchor.constraint(equalTo: toolbar.centerYAnchor),
            stackView.leadingAnchor.constraint(equalTo: toolbar.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: toolbar.trailingAnchor, constant: -20)
        ])
    }
    
    private func setupToolPicker() {
        guard view.window != nil else { return }
        
        toolPicker = PKToolPicker()
        toolPicker?.setVisible(true, forFirstResponder: canvasView)
        toolPicker?.addObserver(canvasView)
        canvasView.becomeFirstResponder()
    }
    
    private func restoreDrawing() {
        if let preservedDrawing = canvas.getPreservedDrawing() {
            canvasView.drawing = preservedDrawing
        }
    }
    
    @objc private func submitTapped() {
        // Check if canvas has content
        guard !canvasView.drawing.strokes.isEmpty else {
            // Show alert or just return - empty canvas cannot be submitted
            return
        }
        
        // Export to PNG with white background (PencilKit renders strokes on transparent by default)
        let drawingImage = canvasView.drawing.image(from: canvasView.bounds, scale: 1.0)
        
        // Create image with white background
        let renderer = UIGraphicsImageRenderer(size: canvasView.bounds.size)
        let image = renderer.image { context in
            // Fill with white background
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: canvasView.bounds.size))
            // Draw the strokes on top
            drawingImage.draw(at: .zero)
        }
        
        guard let pngData = image.pngData() else {
            delegate?.canvasDidCancel()
            return
        }
        
        let base64String = "data:image/png;base64," + pngData.base64EncodedString()
        
        // Clear preserved state after successful submit
        canvas.setPreservedDrawing(nil)
        
        dismiss(animated: true) {
            self.delegate?.canvasDidSubmit(imageData: base64String)
        }
    }
    
    @objc private func minimizeTapped() {
        // Preserve current drawing
        canvas.setPreservedDrawing(canvasView.drawing)
        
        let hasContent = !canvasView.drawing.strokes.isEmpty
        
        dismiss(animated: true) {
            self.delegate?.canvasDidMinimize(hasContent: hasContent)
        }
    }
}

// MARK: - UISheetPresentationControllerDelegate
@available(iOS 15.0, *)
extension CanvasViewController: UISheetPresentationControllerDelegate {
    func presentationControllerWillDismiss(_ presentationController: UIPresentationController) {
        // When user swipes down to dismiss, treat it as minimize (preserve canvas)
        canvas.setPreservedDrawing(canvasView.drawing)
    }
    
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        // Called after the sheet is dismissed by swipe
        let hasContent = !canvasView.drawing.strokes.isEmpty
        delegate?.canvasDidMinimize(hasContent: hasContent)
    }
}
