cask "pocketgull" do
  version "1.39.0"
  sha256 :no_check

  url "https://github.com/pocketgull-app/pocketgull/releases/download/v#{version}/PocketGull-v#{version}-macos.zip"
  name "PocketGull"
  desc "Real-time clinical intelligence, care plan strategy, and live consult engine"
  homepage "https://pocketgull.app/"

  auto_updates true
  depends_on macos: ">= :monterey"

  app "PocketGull.app"
  binary "#{appdir}/PocketGull.app/Contents/MacOS/gull", target: "gull"

  zap trash: [
    "~/Library/Application Support/app.pocketgull.pocketgull",
    "~/Library/Preferences/app.pocketgull.pocketgull.plist",
    "~/Library/Saved Application State/app.pocketgull.pocketgull.savedState",
  ]
end
