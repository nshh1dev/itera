/** @param {string[]} args @param {string} [platform] */
export function dockerCommand(args, platform = process.platform) {
  return platform === "win32"
    ? ["wsl.exe", ["-d", "Ubuntu-24.04", "-u", "root", "--exec", "docker", ...args]]
    : ["docker", args];
}

/** @param {string[]} args @param {boolean} [development] */
export function composeArgs(args, development = false) {
  return ["compose", "--env-file", ".local/docker.env", "-f", "compose.yaml", "-f", "compose.app.yaml", ...(development ? ["-f", "compose.dev.yaml"] : []), ...args];
}
