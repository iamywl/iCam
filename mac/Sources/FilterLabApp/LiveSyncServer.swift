import Foundation
import Network
import CryptoKit
import FilterEngine

/// On-demand HTTP + RFC 6455 WebSocket bridge embedded inside FilterLab.
/// Remains strictly OFF by default per AGENTS.md Zero-Daemon mandate; runs ONLY when toggled ON by user.
final class LiveSyncServer: @unchecked Sendable {
    struct PayloadState: Sendable {
        var catalog: RecipeCatalog
        var activeId: String
        var compareLeftId: String
        var compareRightId: String
    }

    private let queue = DispatchQueue(label: "com.icam.filterlab.livesync", qos: .utility)
    private var listener: NWListener?
    private var webSockets: [ObjectIdentifier: WebSocketPeer] = [:]
    private let stateLock = NSLock()
    private var currentState: PayloadState
    private let webRootURL: URL?

    var onSnapshotReceived: (@Sendable (Data, String) -> Void)?
    var onClientCountChanged: (@Sendable (Int) -> Void)?

    private(set) var boundPort: UInt16 = 51920

    init(initialState: PayloadState) {
        self.currentState = initialState
        self.webRootURL = Self.locateWebRoot()
    }

    static func locateWebRoot() -> URL? {
        let fm = FileManager.default
        if let bundleWeb = Bundle.main.resourceURL?.appendingPathComponent("web"),
           fm.fileExists(atPath: bundleWeb.appendingPathComponent("index.html").path) {
            return bundleWeb
        }
        var dir = URL(fileURLWithPath: fm.currentDirectoryPath)
        for _ in 0..<8 {
            let candidate = dir.appendingPathComponent("web")
            if fm.fileExists(atPath: candidate.appendingPathComponent("index.html").path) {
                return candidate
            }
            if let sharedURL = RecipeLoader.canonicalSharedRecipesURL() {
                let rootCandidate = sharedURL.deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("web")
                if fm.fileExists(atPath: rootCandidate.appendingPathComponent("index.html").path) {
                    return rootCandidate
                }
            }
            let parent = dir.deletingLastPathComponent()
            if parent.path == dir.path { break }
            dir = parent
        }
        return nil
    }

    static func localIPv4Address() -> String? {
        var address: String?
        var ifaddr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddr) == 0, let firstAddr = ifaddr else { return nil }
        defer { freeifaddrs(ifaddr) }

        for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
            let flags = Int32(ptr.pointee.ifa_flags)
            guard (flags & (IFF_UP | IFF_RUNNING)) == (IFF_UP | IFF_RUNNING),
                  (flags & IFF_LOOPBACK) == 0,
                  let addr = ptr.pointee.ifa_addr,
                  addr.pointee.sa_family == UInt8(AF_INET) else { continue }

            let name = String(cString: ptr.pointee.ifa_name)
            var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
            if getnameinfo(addr, socklen_t(addr.pointee.sa_len), &hostname, socklen_t(hostname.count), nil, 0, NI_NUMERICHOST) == 0 {
                let ip = String(cString: hostname)
                if name.hasPrefix("en") {
                    return ip
                }
                address = ip
            }
        }
        return address
    }

    func start(preferredPort: UInt16 = 51920, onReady: @escaping @Sendable (Result<UInt16, Error>) -> Void) {
        stop()

        do {
            let params = NWParameters.tcp
            params.allowLocalEndpointReuse = true
            let port = NWEndpoint.Port(rawValue: preferredPort) ?? .any
            let newListener = try NWListener(using: params, on: port)

            newListener.stateUpdateHandler = { [weak self] state in
                switch state {
                case .ready:
                    let actualPort = newListener.port?.rawValue ?? preferredPort
                    self?.boundPort = actualPort
                    onReady(.success(actualPort))
                case .failed(let err):
                    if preferredPort != 0 {
                        // Retry on ephemeral port if preferredPort is occupied
                        self?.start(preferredPort: 0, onReady: onReady)
                    } else {
                        onReady(.failure(err))
                    }
                default:
                    break
                }
            }

            newListener.newConnectionHandler = { [weak self] conn in
                self?.handleNewConnection(conn)
            }

            newListener.start(queue: queue)
            self.listener = newListener
        } catch {
            onReady(.failure(error))
        }
    }

    func stop() {
        listener?.cancel()
        listener = nil
        queue.async { [weak self] in
            guard let self else { return }
            for (_, peer) in self.webSockets {
                peer.close()
            }
            self.webSockets.removeAll()
            self.notifyClientCount()
        }
    }

    func updateState(_ newState: PayloadState) {
        stateLock.lock()
        currentState = newState
        stateLock.unlock()

        guard let json = buildSyncMessageJSON(state: newState) else { return }
        queue.async { [weak self] in
            guard let self else { return }
            for (_, peer) in self.webSockets {
                peer.sendText(json)
            }
        }
    }

    private func readState() -> PayloadState {
        stateLock.lock()
        defer { stateLock.unlock() }
        return currentState
    }

    private func buildSyncMessageJSON(state: PayloadState) -> String? {
        struct SyncEnvelope: Encodable {
            let type = "syncCatalog"
            let activeId: String
            let compareLeftId: String
            let compareRightId: String
            let catalog: RecipeCatalog
        }
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.withoutEscapingSlashes]
        guard let data = try? encoder.encode(SyncEnvelope(
            activeId: state.activeId,
            compareLeftId: state.compareLeftId,
            compareRightId: state.compareRightId,
            catalog: state.catalog
        )) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func handleNewConnection(_ conn: NWConnection) {
        conn.start(queue: queue)
        receiveHTTPRequest(conn: conn, accumulated: Data())
    }

    private func receiveHTTPRequest(conn: NWConnection, accumulated: Data) {
        conn.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, _, isComplete, error in
            guard let self else { return }
            if let error {
                _ = error
                conn.cancel()
                return
            }
            var buffer = accumulated
            if let data {
                buffer.append(data)
            }

            if let headerEnd = buffer.range(of: Data("\r\n\r\n".utf8)) {
                let headerData = buffer.subdata(in: 0..<headerEnd.lowerBound)
                if let headerStr = String(data: headerData, encoding: .utf8) {
                    self.routeHTTPRequest(conn: conn, headerString: headerStr)
                    return
                }
                conn.cancel()
                return
            }

            if isComplete || buffer.count > 131072 {
                conn.cancel()
                return
            }
            self.receiveHTTPRequest(conn: conn, accumulated: buffer)
        }
    }

    private func routeHTTPRequest(conn: NWConnection, headerString: String) {
        let lines = headerString.components(separatedBy: "\r\n")
        guard let requestLine = lines.first else {
            conn.cancel()
            return
        }
        let parts = requestLine.split(separator: " ")
        guard parts.count >= 2 else {
            conn.cancel()
            return
        }

        let rawTarget = String(parts[1])
        let pathOnly = rawTarget.split(separator: "?").first.map(String.init) ?? "/"

        var headers: [String: String] = [:]
        for line in lines.dropFirst() {
            if let colon = line.firstIndex(of: ":") {
                let key = line[..<colon].trimmingCharacters(in: .whitespaces).lowercased()
                let val = line[line.index(after: colon)...].trimmingCharacters(in: .whitespaces)
                headers[key] = val
            }
        }

        if headers["upgrade"]?.lowercased() == "websocket", let wsKey = headers["sec-websocket-key"] {
            upgradeToWebSocket(conn: conn, wsKey: wsKey)
            return
        }

        // Serve HTTP endpoints
        if pathOnly == "/api/catalog" || pathOnly == "/shared/recipes.json" || pathOnly == "/recipes.json" {
            let state = readState()
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
            if let body = try? encoder.encode(state.catalog) {
                sendHTTPResponse(conn: conn, status: "200 OK", contentType: "application/json; charset=utf-8", body: body)
            } else {
                sendHTTPResponse(conn: conn, status: "500 Internal Server Error", contentType: "text/plain", body: Data("Encoding error".utf8))
            }
            return
        }

        guard let webRoot = webRootURL else {
            let msg = "FilterLab Web Camera root directory ('web/') not found."
            sendHTTPResponse(conn: conn, status: "404 Not Found", contentType: "text/plain; charset=utf-8", body: Data(msg.utf8))
            return
        }

        let cleanRelative: String = (pathOnly == "/" || pathOnly.isEmpty) ? "index.html" : String(pathOnly.dropFirst())
        let resolvedURL = webRoot.appendingPathComponent(cleanRelative).standardizedFileURL
        // Strict directory-traversal protection
        guard resolvedURL.path.hasPrefix(webRoot.standardizedFileURL.path),
              let fileData = try? Data(contentsOf: resolvedURL) else {
            sendHTTPResponse(conn: conn, status: "404 Not Found", contentType: "text/plain", body: Data("Not Found".utf8))
            return
        }

        sendHTTPResponse(conn: conn, status: "200 OK", contentType: Self.mimeType(for: resolvedURL.pathExtension), body: fileData)
    }

    private func sendHTTPResponse(conn: NWConnection, status: String, contentType: String, body: Data) {
        var responseHeader = "HTTP/1.1 \(status)\r\n"
        responseHeader += "Content-Type: \(contentType)\r\n"
        responseHeader += "Content-Length: \(body.count)\r\n"
        responseHeader += "Cache-Control: no-store\r\n"
        responseHeader += "Access-Control-Allow-Origin: *\r\n"
        responseHeader += "Connection: close\r\n\r\n"

        var packet = Data(responseHeader.utf8)
        packet.append(body)
        conn.send(content: packet, completion: .contentProcessed { _ in
            conn.cancel()
        })
    }

    private func upgradeToWebSocket(conn: NWConnection, wsKey: String) {
        let magic = wsKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        let hash = Insecure.SHA1.hash(data: Data(magic.utf8))
        let acceptKey = Data(hash).base64EncodedString()

        let handshake = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: \(acceptKey)\r\n\r\n"
        let peer = WebSocketPeer(conn: conn, queue: queue)
        let peerID = ObjectIdentifier(peer)

        peer.onTextMessage = { [weak self] text in
            self?.handleWebSocketText(text)
        }
        peer.onClose = { [weak self] in
            guard let self else { return }
            self.webSockets.removeValue(forKey: peerID)
            self.notifyClientCount()
        }

        conn.send(content: Data(handshake.utf8), completion: .contentProcessed { [weak self] error in
            guard let self, error == nil else {
                conn.cancel()
                return
            }
            self.webSockets[peerID] = peer
            self.notifyClientCount()
            if let initialJSON = self.buildSyncMessageJSON(state: self.readState()) {
                peer.sendText(initialJSON)
            }
            peer.startReading()
        })
    }

    private func handleWebSocketText(_ text: String) {
        guard let data = text.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = obj["type"] as? String else { return }

        if type == "snapshot",
           let dataUrl = obj["dataUrl"] as? String,
           let comma = dataUrl.firstIndex(of: ",") {
            let base64Part = String(dataUrl[dataUrl.index(after: comma)...])
            if let imgData = Data(base64Encoded: base64Part, options: .ignoreUnknownCharacters) {
                let filename = (obj["filename"] as? String) ?? "WebCam_Capture.jpg"
                onSnapshotReceived?(imgData, filename)
            }
        }
    }

    private func notifyClientCount() {
        let count = webSockets.count
        onClientCountChanged?(count)
    }

    private static func mimeType(for ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "js", "mjs": return "application/javascript; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        default: return "application/octet-stream"
        }
    }
}

/// Minimal RFC 6455 WebSocket peer framing handler.
private final class WebSocketPeer: @unchecked Sendable {
    private let conn: NWConnection
    private let queue: DispatchQueue
    private var readBuffer = Data()
    private var isClosed = false

    var onTextMessage: (@Sendable (String) -> Void)?
    var onClose: (@Sendable () -> Void)?

    init(conn: NWConnection, queue: DispatchQueue) {
        self.conn = conn
        self.queue = queue
    }

    func startReading() {
        readLoop()
    }

    func close() {
        guard !isClosed else { return }
        isClosed = true
        conn.cancel()
    }

    func sendText(_ text: String) {
        sendFrame(opcode: 0x1, payload: Data(text.utf8))
    }

    private func sendFrame(opcode: UInt8, payload: Data) {
        guard !isClosed else { return }
        var frame = Data([0x80 | (opcode & 0x0F)])
        let count = payload.count
        if count <= 125 {
            frame.append(UInt8(count))
        } else if count <= 65535 {
            frame.append(126)
            var len16 = UInt16(count).bigEndian
            frame.append(Data(bytes: &len16, count: 2))
        } else {
            frame.append(127)
            var len64 = UInt64(count).bigEndian
            frame.append(Data(bytes: &len64, count: 8))
        }
        frame.append(payload)
        conn.send(content: frame, completion: .contentProcessed { [weak self] err in
            if err != nil {
                self?.finish()
            }
        })
    }

    private func readLoop() {
        guard !isClosed else { return }
        conn.receive(minimumIncompleteLength: 1, maximumLength: 262144) { [weak self] data, _, isComplete, error in
            guard let self else { return }
            if let data, !data.isEmpty {
                self.readBuffer.append(data)
                self.parseFrames()
            }
            if isComplete || error != nil {
                self.finish()
                return
            }
            self.readLoop()
        }
    }

    private func parseFrames() {
        while readBuffer.count >= 2 {
            let b0 = readBuffer[readBuffer.startIndex]
            let b1 = readBuffer[readBuffer.startIndex + 1]
            let opcode = b0 & 0x0F
            let masked = (b1 & 0x80) != 0
            var offset = 2
            var payloadLen = UInt64(b1 & 0x7F)

            if payloadLen == 126 {
                guard readBuffer.count >= 4 else { return }
                payloadLen = UInt64(readBuffer[readBuffer.startIndex + 2]) << 8 | UInt64(readBuffer[readBuffer.startIndex + 3])
                offset = 4
            } else if payloadLen == 127 {
                guard readBuffer.count >= 10 else { return }
                var val: UInt64 = 0
                for i in 0..<8 {
                    val = (val << 8) | UInt64(readBuffer[readBuffer.startIndex + 2 + i])
                }
                payloadLen = val
                offset = 10
            }

            let maskSize = masked ? 4 : 0
            let totalNeeded = offset + maskSize + Int(payloadLen)
            guard readBuffer.count >= totalNeeded else { return }

            var payload = Data(readBuffer.subdata(in: (offset + maskSize)..<totalNeeded))
            if masked {
                let maskBytes = Array(readBuffer[offset..<(offset + 4)])
                for i in 0..<payload.count {
                    payload[i] ^= maskBytes[i & 3]
                }
            }
            readBuffer.removeFirst(totalNeeded)

            switch opcode {
            case 0x1: // Text
                if let str = String(data: payload, encoding: .utf8) {
                    onTextMessage?(str)
                }
            case 0x8: // Close
                finish()
                return
            case 0x9: // Ping
                sendFrame(opcode: 0xA, payload: payload)
            default:
                break
            }
        }
    }

    private func finish() {
        guard !isClosed else { return }
        isClosed = true
        conn.cancel()
        onClose?()
    }
}
