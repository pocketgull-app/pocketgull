class Pocketgull < Formula
  desc "Real-time medical care plan strategy and live AI consult terminal engine"
  homepage "https://pocketgull.app/"
  url "https://github.com/pocketgull-app/pocketgull/archive/refs/tags/v1.40.0.tar.gz"
  sha256 :no_check
  license "Apache-2.0"

  depends_on "node@24"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
    bin.install_symlink "#{libexec}/lib/node_modules/pocket-gull/scripts/gull.js" => "gull"
    bin.install_symlink "#{libexec}/lib/node_modules/pocket-gull/scripts/gull.js" => "pocketgull"
  end

  test do
    system "#{bin}/pocketgull", "--version"
  end
end
