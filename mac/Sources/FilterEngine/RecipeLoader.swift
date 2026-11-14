import Foundation

public enum RecipeLoader {
    /// Resolves canonical `shared/recipes.json` whether running from `.app` bundle, `swift run`, or repo subdirectories.
    public static func loadCatalog(customURL: URL? = nil) throws -> RecipeCatalog {
        let candidates: [URL] = ([
            customURL,
            Bundle.main.url(forResource: "recipes", withExtension: "json"),
            URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("shared/recipes.json"),
            URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("../shared/recipes.json"),
            repositoryRootFromSource()?.appendingPathComponent("shared/recipes.json")
        ]).compactMap { $0 }

        for url in candidates where FileManager.default.fileExists(atPath: url.path) {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(RecipeCatalog.self, from: data)
        }

        throw NSError(
            domain: "FilterEngine.RecipeLoader",
            code: 404,
            userInfo: [NSLocalizedDescriptionKey: "Could not locate shared/recipes.json in bundle or repository."]
        )
    }

    public static func canonicalSharedRecipesURL() -> URL? {
        let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        let direct = cwd.appendingPathComponent("shared/recipes.json")
        if FileManager.default.fileExists(atPath: direct.path) { return direct }
        let parent = cwd.appendingPathComponent("../shared/recipes.json").standardizedFileURL
        if FileManager.default.fileExists(atPath: parent.path) { return parent }
        return repositoryRootFromSource()?.appendingPathComponent("shared/recipes.json")
    }

    private static func repositoryRootFromSource(filePath: String = #filePath) -> URL? {
        var url = URL(fileURLWithPath: filePath).deletingLastPathComponent()
        for _ in 0..<8 {
            let probe = url.appendingPathComponent("shared/recipes.json")
            if FileManager.default.fileExists(atPath: probe.path) {
                return url
            }
            url.deleteLastPathComponent()
        }
        return nil
    }
}
