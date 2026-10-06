import AVFoundation
import UIKit

@objc public class PiPVideoView: UIView {
    public let sampleBufferDisplayLayer = AVSampleBufferDisplayLayer()
    private let frameProcessor = PiPFrameProcessor()
    private var rotationDegrees: Int = 0

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupLayer()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupLayer()
    }

    private func setupLayer() {
        backgroundColor = .black
        sampleBufferDisplayLayer.videoGravity = .resizeAspectFill
        layer.addSublayer(sampleBufferDisplayLayer)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        applyLayout()
    }

    private func applyLayout() {
        // The layer has to be sized in the video's own orientation before the rotation
        // transform is applied, otherwise 90/270 degree frames come out squashed.
        sampleBufferDisplayLayer.setAffineTransform(.identity)
        let swapped = rotationDegrees == 90 || rotationDegrees == 270
        sampleBufferDisplayLayer.bounds = CGRect(
            x: 0,
            y: 0,
            width: swapped ? bounds.height : bounds.width,
            height: swapped ? bounds.width : bounds.height
        )
        sampleBufferDisplayLayer.position = CGPoint(x: bounds.midX, y: bounds.midY)
        sampleBufferDisplayLayer.setAffineTransform(
            CGAffineTransform(rotationAngle: CGFloat(rotationDegrees) * .pi / 180)
        )
    }

    @objc(setVideoRotation:)
    public func setVideoRotation(_ degrees: Int) {
        guard rotationDegrees != degrees else { return }
        rotationDegrees = degrees
        DispatchQueue.main.async { [weak self] in
            self?.applyLayout()
        }
    }

    @objc(enqueuePixelBuffer:)
    public func enqueue(pixelBuffer: CVPixelBuffer) {
        guard let sampleBuffer = frameProcessor.sampleBuffer(from: pixelBuffer) else { return }
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if self.sampleBufferDisplayLayer.status == .failed {
                self.sampleBufferDisplayLayer.flush()
            }
            self.sampleBufferDisplayLayer.enqueue(sampleBuffer)
        }
    }

    @objc(bgraPixelBufferWithWidth:height:)
    public func bgraPixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        return frameProcessor.pixelBuffer(width: width, height: height)
    }

    @objc public func clear() {
        DispatchQueue.main.async { [weak self] in
            self?.sampleBufferDisplayLayer.flushAndRemoveImage()
        }
    }
}
