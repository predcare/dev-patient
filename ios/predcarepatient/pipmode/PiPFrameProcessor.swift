import AVFoundation
import CoreMedia
import CoreVideo
import Foundation

@objc public class PiPFrameProcessor: NSObject {
    private var pixelBufferPool: CVPixelBufferPool?
    private var poolWidth: Int = 0
    private var poolHeight: Int = 0

    /// Returns a BGRA pixel buffer from the pool, recreating the pool when the frame size changes.
    @objc public func pixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        if pixelBufferPool == nil || poolWidth != width || poolHeight != height {
            pixelBufferPool = PiPFrameProcessor.createPixelBufferPool(width: width, height: height)
            poolWidth = width
            poolHeight = height
        }

        guard let pool = pixelBufferPool else { return nil }

        var buffer: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, pool, &buffer)
        return status == kCVReturnSuccess ? buffer : nil
    }

    private static func createPixelBufferPool(width: Int, height: Int) -> CVPixelBufferPool? {
        let poolAttributes: [CFString: Any] = [
            kCVPixelBufferPoolMinimumBufferCountKey: 3
        ]
        let pixelBufferAttributes: [CFString: Any] = [
            kCVPixelBufferPixelFormatTypeKey: kCVPixelFormatType_32BGRA,
            kCVPixelBufferWidthKey: width,
            kCVPixelBufferHeightKey: height,
            kCVPixelBufferIOSurfacePropertiesKey: [:] as [CFString: Any]
        ]

        var pool: CVPixelBufferPool?
        let status = CVPixelBufferPoolCreate(
            kCFAllocatorDefault,
            poolAttributes as CFDictionary,
            pixelBufferAttributes as CFDictionary,
            &pool
        )
        return status == kCVReturnSuccess ? pool : nil
    }

    @objc public func sampleBuffer(from pixelBuffer: CVPixelBuffer) -> CMSampleBuffer? {
        var formatDescription: CMVideoFormatDescription?
        let status = CMVideoFormatDescriptionCreateForImageBuffer(
            allocator: kCFAllocatorDefault,
            imageBuffer: pixelBuffer,
            formatDescriptionOut: &formatDescription
        )
        guard status == noErr, let format = formatDescription else { return nil }

        var sampleTiming = CMSampleTimingInfo(
            duration: CMTime(value: 1, timescale: 30),
            presentationTimeStamp: CMClockGetTime(CMClockGetHostTimeClock()),
            decodeTimeStamp: .invalid
        )

        var sampleBuffer: CMSampleBuffer?
        let sampleStatus = CMSampleBufferCreateForImageBuffer(
            allocator: kCFAllocatorDefault,
            imageBuffer: pixelBuffer,
            dataReady: true,
            makeDataReadyCallback: nil,
            refcon: nil,
            formatDescription: format,
            sampleTiming: &sampleTiming,
            sampleBufferOut: &sampleBuffer
        )
        guard sampleStatus == noErr, let buffer = sampleBuffer else { return nil }

        // AVSampleBufferDisplayLayer holds frames back without this attachment, since the
        // timestamps come from a clock it does not control.
        if let attachments = CMSampleBufferGetSampleAttachmentsArray(buffer, createIfNecessary: true) {
            let dictionary = unsafeBitCast(
                CFArrayGetValueAtIndex(attachments, 0),
                to: CFMutableDictionary.self
            )
            CFDictionarySetValue(
                dictionary,
                Unmanaged.passUnretained(kCMSampleAttachmentKey_DisplayImmediately).toOpaque(),
                Unmanaged.passUnretained(kCFBooleanTrue).toOpaque()
            )
        }

        return buffer
    }
}
