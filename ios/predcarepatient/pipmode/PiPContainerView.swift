import UIKit

@objc public class PiPContainerView: UIView {
    @objc public static let shared = PiPContainerView()

    @objc public let remoteVideoView = PiPVideoView()

    private let placeholderView = UIView()
    private let placeholderLabel = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }

    private func setupViews() {
        backgroundColor = .black

        placeholderView.backgroundColor = UIColor(red: 0.12, green: 0.16, blue: 0.23, alpha: 1.0)
        placeholderLabel.textColor = .white
        placeholderLabel.textAlignment = .center
        placeholderLabel.font = .systemFont(ofSize: 15, weight: .semibold)
        placeholderLabel.text = "Camera off"
        placeholderLabel.numberOfLines = 2

        addSubview(placeholderView)
        placeholderView.addSubview(placeholderLabel)
        addSubview(remoteVideoView)

        placeholderView.translatesAutoresizingMaskIntoConstraints = false
        placeholderLabel.translatesAutoresizingMaskIntoConstraints = false
        remoteVideoView.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            placeholderView.topAnchor.constraint(equalTo: topAnchor),
            placeholderView.bottomAnchor.constraint(equalTo: bottomAnchor),
            placeholderView.leadingAnchor.constraint(equalTo: leadingAnchor),
            placeholderView.trailingAnchor.constraint(equalTo: trailingAnchor),

            placeholderLabel.centerXAnchor.constraint(equalTo: placeholderView.centerXAnchor),
            placeholderLabel.centerYAnchor.constraint(equalTo: placeholderView.centerYAnchor),
            placeholderLabel.leadingAnchor.constraint(
                greaterThanOrEqualTo: placeholderView.leadingAnchor,
                constant: 8
            ),

            remoteVideoView.topAnchor.constraint(equalTo: topAnchor),
            remoteVideoView.bottomAnchor.constraint(equalTo: bottomAnchor),
            remoteVideoView.leadingAnchor.constraint(equalTo: leadingAnchor),
            remoteVideoView.trailingAnchor.constraint(equalTo: trailingAnchor)
        ])

        updateRemoteVisibility(showRemote: false)
    }

    @objc(updateRemoteVisibility:)
    public func updateRemoteVisibility(showRemote: Bool) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.remoteVideoView.isHidden = !showRemote
            self.placeholderView.isHidden = showRemote
            if !showRemote {
                self.remoteVideoView.clear()
            }
        }
    }

    @objc(setPlaceholderText:)
    public func setPlaceholderText(_ text: String) {
        DispatchQueue.main.async { [weak self] in
            self?.placeholderLabel.text = text
        }
    }
}
