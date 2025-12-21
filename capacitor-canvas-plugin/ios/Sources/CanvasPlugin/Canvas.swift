import Foundation
import UIKit
import PencilKit

// MARK: - BoundingBox
struct BoundingBox {
    var minX: CGFloat = .infinity
    var minY: CGFloat = .infinity
    var maxX: CGFloat = -.infinity
    var maxY: CGFloat = -.infinity
    
    mutating func expand(to point: CGPoint) {
        minX = min(minX, point.x)
        minY = min(minY, point.y)
        maxX = max(maxX, point.x)
        maxY = max(maxY, point.y)
    }
    
    var rect: CGRect {
        guard minX != .infinity else {
            return .zero
        }
        return CGRect(
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        )
    }
}

// MARK: - ScalingResult
struct ScalingResult {
    let original: CGRect      // Original bounding box
    let scale: CGFloat        // Scale factor applied
    let size: CGSize          // Final rendered size
}

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
    func canvasDidSubmit(imageData: String, imageBinarySize: Int)
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
        
        // Only allow drawing with Apple Pencil, disable finger drawing
        if #available(iOS 14.0, *) {
            canvasView.drawingPolicy = .pencilOnly
        } else {
            canvasView.allowsFingerDrawing = false
        }
        
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
        
        // Call calculateBoundingBox for current drawing
        let boundingBox = calculateBoundingBox(for: canvasView.drawing)
        
        // Apply padding and clipping
        let paddedBox = addPaddingToBoundingBox(boundingBox)
        let clippedBox = clipPaddedBoxToCanvasBounds(paddedBox, canvasBounds: canvasView.bounds)
        
        // Call scaleIfNeeded to get final dimensions
        let scalingResult = scaleIfNeeded(rect: clippedBox)
        
        // Export image using cropped region and scale factor
        let drawingImage = canvasView.drawing.image(from: scalingResult.original, scale: scalingResult.scale)
        
        // Maintain existing white background rendering
        let renderer = UIGraphicsImageRenderer(size: scalingResult.size)
        let image = renderer.image { context in
            // Fill with white background
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: scalingResult.size))
            // Draw the strokes on top
            drawingImage.draw(at: .zero)
        }
        
        // Call logExportDimensions with all dimension info
        logExportDimensions(
            original: canvasView.bounds.size,
            cropped: clippedBox.size,
            final: scalingResult.size
        )
        
        // Maintain existing base64 encoding
        guard let pngData = image.pngData() else {
            delegate?.canvasDidCancel()
            return
        }
        
        let base64String = "data:image/png;base64," + pngData.base64EncodedString()
        let binarySize = pngData.count
        
        // Log transfer metrics
        logTransferMetrics(binarySize: binarySize)
        
        // Clear preserved state after successful submit
        canvas.setPreservedDrawing(nil)
        
        dismiss(animated: true) {
            self.delegate?.canvasDidSubmit(imageData: base64String, imageBinarySize: binarySize)
        }
    }
    
    @objc private func minimizeTapped() {
        minimizeCanvas()
    }
    
    // MARK: - Internal Methods
    
    func minimizeFromPencilTap() {
        minimizeCanvas()
    }
    
    private func minimizeCanvas() {
        // Preserve current drawing
        canvas.setPreservedDrawing(canvasView.drawing)
        
        let hasContent = !canvasView.drawing.strokes.isEmpty
        
        dismiss(animated: true) {
            self.delegate?.canvasDidMinimize(hasContent: hasContent)
        }
    }
    
    // MARK: - Bounding Box Calculation
    
    func calculateBoundingBox(for drawing: PKDrawing) -> CGRect {
        var bbox = BoundingBox()
        
        // Iterate through all strokes in PKDrawing
        for stroke in drawing.strokes {
            // Iterate through all points in each stroke path
            for point in stroke.path {
                // Expand bounding box to include each point
                bbox.expand(to: point.location)
            }
        }
        
        // Return empty rect for drawings with no strokes
        return bbox.rect
    }
    
    // MARK: - Padding Logic
    
    func addPaddingToBoundingBox(_ boundingBox: CGRect, padding: CGFloat = 32.0) -> CGRect {
        // Inset bounding box by -32 pixels on all sides (expand by 32 pixels)
        let paddedBox = boundingBox.insetBy(dx: -padding, dy: -padding)
        
        // Handle edge case where padding creates negative dimensions
        // If the original bounding box is smaller than 2*padding, ensure minimum size
        let minWidth = max(paddedBox.width, 2 * padding)
        let minHeight = max(paddedBox.height, 2 * padding)
        
        return CGRect(
            x: paddedBox.origin.x,
            y: paddedBox.origin.y,
            width: minWidth,
            height: minHeight
        )
    }
    
    // MARK: - Clipping Logic
    
    func clipPaddedBoxToCanvasBounds(_ paddedBox: CGRect, canvasBounds: CGRect) -> CGRect {
        // Intersect padded box with canvas bounds
        let clippedBox = paddedBox.intersection(canvasBounds)
        
        // Ensure result stays within valid canvas area
        // If intersection results in empty rect, return the canvas bounds
        if clippedBox.isEmpty {
            return canvasBounds
        }
        
        return clippedBox
    }
    
    // MARK: - Scaling Logic
    
    func scaleIfNeeded(rect: CGRect, maxDimension: CGFloat = 3200.0) -> ScalingResult {
        let width = rect.width
        let height = rect.height
        
        // Check if width or height exceeds 3200 pixels
        guard width > maxDimension || height > maxDimension else {
            // Return scale of 1.0 if no scaling needed
            return ScalingResult(
                original: rect,
                scale: 1.0,
                size: rect.size
            )
        }
        
        // Calculate scale factor as min(3200/width, 3200/height)
        let scale = min(maxDimension / width, maxDimension / height)
        let finalSize = CGSize(
            width: width * scale,
            height: height * scale
        )
        
        // Return ScalingResult with scale factor and final dimensions
        return ScalingResult(
            original: rect,
            scale: scale,
            size: finalSize
        )
    }
    
    // MARK: - Logging
    
    func logExportDimensions(original: CGSize, cropped: CGSize, final: CGSize) {
        // Log original canvas dimensions
        // Log cropped dimensions after bounding box
        // Log final dimensions after scaling
        // Calculate and log percentage reduction
        // Format output in structured, readable format
        
        let originalArea = original.width * original.height
        let finalArea = final.width * final.height
        let reduction = originalArea > 0 ? (1.0 - finalArea / originalArea) * 100 : 0
        
        print("""
        [Canvas Export]
        Original: \(Int(original.width))x\(Int(original.height))
        Cropped:  \(Int(cropped.width))x\(Int(cropped.height))
        Final:    \(Int(final.width))x\(Int(final.height))
        Reduction: \(Int(reduction))%
        """)
    }
    
    func logTransferMetrics(binarySize: Int) {
        // Calculate theoretical base64 size (4/3 ratio with padding)
        let base64Size = Int(ceil(Double(binarySize) * 4.0 / 3.0))
        let savings = base64Size - binarySize
        let savingsPercent = base64Size > 0 ? Double(savings) / Double(base64Size) * 100 : 0
        
        print("""
        [Binary Transfer]
        Binary size: \(binarySize) bytes
        Base64 would be: \(base64Size) bytes
        Savings: \(savings) bytes (\(Int(savingsPercent))%)
        """)
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