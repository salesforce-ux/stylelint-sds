import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import readline from "readline";

const packageDirs = {
  eslint: path.resolve("packages/eslint-plugin-slds"),
  stylelint: path.resolve("packages/stylelint-plugin-slds"),
  linter: path.resolve("packages/slds-linter"),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptGitHubToken() {
  return new Promise((resolve) => {
    rl.question("Please enter your GitHub token: ", (token) => {
      resolve(token);
    });
  });
}

function promptGitHubUsername() {
  return new Promise((resolve) => {
    rl.question("Please enter your GitHub username: ", (user) => {
      resolve(user);
    });
  });
}

function createGitHubRelease(version, token, user, tgzFilePath) {
  try {
    // execSync(
    //         `npx gh-release --token ${token} --owner ${user} --repo test --tag v${version} --name "Release v${version}" --assets ${tgzFilePath} --dry-run`,
    //         { stdio: "inherit" }
    //       );
    console.log(
      `npx gh-release --token ${token} --owner ${user} --repo test --tag v${version} --name "Release v${version}" --assets ${tgzFilePath} --dry-run`,
      { stdio: "inherit" }
    );
    console.log(`GitHub Release for v${version} created successfully.`);
  } catch (error) {
    console.error("Error creating GitHub release:", error.message);
  }
}
function runCommand(command, cwd) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { cwd, stdio: "inherit" });
  } catch (error) {
    console.error(`Error running command in ${cwd}:`, error.message);
    process.exit(1);
  }
}

function isValidVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
}

function packPackage(packageLinter, versionLinter) {
  execSync("npm pack", { cwd: packageLinter, stdio: "inherit" });
  const tgzFilePath = path.resolve(
    packageLinter,
    `salesforce-ux-slds-linter-${versionLinter}.tgz`
  );
  return tgzFilePath;
}

function promptVersion(packageName) {
  const packageDir = packageDirs[packageName];
  const packageJsonPath = path.join(packageDir, "package.json");

  try {
    // Read the current version from the package.json file for prompt
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const currentVersion = packageJson.version;
    return new Promise((resolve) => {
      rl.question(
        `Current version of package "${packageName}" is ${currentVersion}. Enter the version number (e.g., 1.2.3): `,
        (versionNumber) => {
          if (!isValidVersion(versionNumber)) {
            console.log(
              "Invalid version format. Please enter a valid version number (e.g., 1.0.1)."
            );
            resolve(promptVersion(packageName)); // Retry if invalid
            return;
          }

          // Ask for version type (normal/alpha/beta)
          rl.question(
            "Enter version type (normal/alpha/beta): ",
            (versionType) => {
              const normalizedType = versionType.toLowerCase().trim();

              let finalVersion = versionNumber;
              if (["alpha", "beta"].includes(normalizedType)) {
                finalVersion += `-${normalizedType}`;
              }

              resolve(finalVersion);
            }
          );
        }
      );
    });
  } catch (error) {
    console.error(
      `Error reading package.json for ${packageName}:`,
      error.message
    );
    return promptVersion(packageName);
  }
}

function updateDependenciesInLinter(versionEslint, versionStylelint) {
  try {
    const packagePath = path.join(packageDirs.linter, "package.json");
    const packageLinter = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    packageLinter.dependencies["@salesforce-ux/eslint-plugin-slds"] =
      `^${versionEslint}`;
    packageLinter.dependencies["@salesforce-ux/stylelint-plugin-slds"] =
      `^${versionStylelint}`;

    fs.writeFileSync(packagePath, JSON.stringify(packageLinter, null, 2));
    console.log("Updated dependencies for package with new versions");
  } catch (error) {
    console.error("Error in updating dependencies", error.message);
  }
}

function buildPackage(packageDir) {
  try {
    console.log(`Building package in ${packageDir}...`);
    runCommand("npm run build", packageDir);
  } catch (error) {
    console.error("Error in building package", error);
  }
}

async function publishPackage(packageName, version) {
  try {
    const packageDir = packageDirs[packageName];

    console.log(`Publishing package ${packageName} with version ${version}...`);

    runCommand(`npm version ${version} --no-git-tag-version`, packageDir);

    buildPackage(packageDir);

    console.log(`Publishing ${packageName}...`);
    //   runCommand('npm publish --access=restricted', packageDir);

    console.log(`Package ${packageName} published successfully!`);
  } catch (error) {
    console.error("Error Publishing individual package", error.message);
  }
}

async function publishLinter(versionEslint, versionStylelint, versionLinter) {
  try {
    updateDependenciesInLinter(versionEslint, versionStylelint);

    await publishPackage("linter", versionLinter);
  } catch (error) {
    console.error("Error in Publishing Linter", error.message);
  }
}

async function publishPackages() {
  try {
    const githubToken = await promptGitHubToken();
    const githubUsername = await promptGitHubUsername();
    const versionEslint = await promptVersion("eslint");
    const versionStylelint = await promptVersion("stylelint");
    const versionLinter = await promptVersion("linter");

    const publishTasks = [
      publishPackage("eslint", versionEslint),
      publishPackage("stylelint", versionStylelint),
    ];

    await Promise.all(publishTasks);

    await publishLinter(versionEslint, versionStylelint, versionLinter);

    console.log("All packages published successfully!");

    //Packing
    console.log("Packing..");
    const tgzPath = packPackage(packageDirs["linter"], versionLinter);

    //Create a github release
    console.log("Creating github release...");
    createGitHubRelease(versionLinter, githubToken, githubUsername, tgzPath);
  } catch (error) {
    console.error("Error in publishing packages", error.message);
  } finally {
    rl.close();
  }
}

publishPackages();
