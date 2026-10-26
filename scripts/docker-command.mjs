/** @param {string[]} args @param {string} [platform] */
export function dockerCommand(args, platform = process.platform) {
  return platform === "win32"
    ? ["wsl.exe", ["-d", "Ubuntu-24.04", "-u", "root", "--exec", "docker", ...args]]
    : ["docker", args];
}

/** @param {string[]} args @param {boolean} [development] */
export function composeArgs(args, development = false) {
  return ["compose", "--project-directory", ".", "--env-file", ".local/docker.env", "-f", "docker/compose.yaml", "-f", "docker/compose.app.yaml", ...(development ? ["-f", "docker/compose.dev.yaml"] : []), ...args];
}
