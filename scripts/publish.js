import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import readline from "readline";
import chalk from 'chalk';

//importing package.json of packages
import * as eslintPackage from "../packages/eslint-plugin-slds/package.json" with { type: "json" };
import * as stylelintPackage from "../packages/stylelint-plugin-slds/package.json" with { type: "json" };
import * as linterPackage from "../packages/slds-linter/package.json" with { type: "json" };

const packageDirs = {
  eslint: {
    path: path.resolve("packages/eslint-plugin-slds"),
    version: eslintPackage.default.version,
  },
  stylelint: {
    path: path.resolve("packages/stylelint-plugin-slds"),
    version: stylelintPackage.default.version,
  },
  linter: {
    path: path.resolve("packages/slds-linter"),
    version: linterPackage.default.version,
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptGHRelease() {
  return new Promise((resolve) => {
    rl.question(
      chalk.cyan("Please enter your repo package version for gh release: "),
      (version) => {
        resolve(version);
      }
    );
  });
}

async function createGitHubRelease(tgzFilePath) {
  try {
    /*
    semantic-release
    Semantic release not able to add tgz file in the release object.
    */
    // console.log(`Running semantic-release...`);
    // runCommand(`CI=true GH_TOKEN=${token} npx semantic-release --debug`);

    /*
    gh-release 
    Takes GH_TOKEN from process.env
    no option of dry-run
    */
    const versionRelease = await promptGHRelease();
    runCommand(`npm version ${versionRelease} --no-git-tag-version`);
    //runCommand(`gh release create v${versionRelease} ${tgzFilePath} --title "Release v${versionRelease}" --notes "Release notes for v${versionRelease}"`)
    console.log(chalk.green(`GitHub Release for v${versionRelease} created successfully.`));
  } catch (error) {
    console.error(chalk.red("Error creating GitHub release:", error.message));
  }
}

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(chalk.green(`Running: ${command}`));
    execSync(command, { cwd, stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red(`Error running command in ${cwd}:`, error.message));
    process.exit(1);
  }
}

function isValidVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
}

function packPackage(packageLinter, versionLinter) {
  runCommand(`mkdir -p dist`, packageLinter);
  runCommand("npm pack --pack-destination ./dist", packageLinter);

  const tgzFilePath = path.resolve(
    packageLinter,
    `salesforce-ux-slds-linter-${versionLinter}.tgz`
  );
  return tgzFilePath;
}

async function promptVersionNumber(packageName) {
  try {
    const currentVersion = packageDirs[packageName].version;
    return new Promise((resolve) => {
      rl.question(
        chalk.cyan(`Current version of package "${packageName}" is ${currentVersion}. Enter the version number (e.g., 1.2.3): `),
        (versionNumber) => {
          if (!isValidVersion(versionNumber)) {
            console.log(
              chalk.red("Invalid version format. Please enter a valid version number (e.g., 1.0.1).")
            );
            resolve(promptVersionNumber(packageName, currentVersion)); // Retry if invalid
          } else {
            resolve(versionNumber); // Return valid version number
          }
        }
      );
    });
  } catch (error) {
    console.error(
      chalk.red(`Error reading package.json for ${packageName}:`,
      error.message)
    );
    return promptVersionNumber(packageName);
  }
}

async function promptVersionType() {
  return new Promise((resolve) => {
    rl.question(
      chalk.cyan("Choose release type [ alpha | beta | final ]: "),
      (versionType) => {
        const normalizedType =
          versionType.trim().length === 0
            ? "final"
            : versionType.toLowerCase().trim();

        // Validate the version type
        if (["alpha", "beta", "final"].includes(normalizedType)) {
          resolve(normalizedType); // Return valid version type
        } else {
          console.log(
            chalk.red('Invalid version type. Please enter "alpha", "beta", or "final".')
          );
          resolve(promptVersionType()); // Retry if invalid
        }
      }
    );
  });
}

async function promptVersion(packageName) {
  try {
    const versionNumber = await promptVersionNumber(packageName); // Prompt for version number
    const versionType = await promptVersionType(); // Prompt for version type

    let finalVersion = versionNumber;
    if (["alpha", "beta"].includes(versionType)) {
      finalVersion += `-${versionType}`;
    }

    return finalVersion;
  } catch (error) {
    console.error(chalk.red("Error in version fetching...", error.message));
  }
}

function updateDependenciesInLinter(versionEslint, versionStylelint) {
  try {
    const packagePath = path.join(packageDirs.linter.path, "package.json");

    linterPackage.default.dependencies["@salesforce-ux/eslint-plugin-slds"] =
      `^${versionEslint}`;
    linterPackage.default.dependencies["@salesforce-ux/stylelint-plugin-slds"] =
      `^${versionStylelint}`;

    fs.writeFileSync(
      packagePath,
      JSON.stringify(linterPackage.default, null, 2)
    );
    console.log(chalk.green("Updated dependencies for package with new versions"));
  } catch (error) {
    console.error(chalk.red("Error in updating dependencies", error.message));
  }
}

function buildPackage(packageDir) {
  try {
    console.log(chalk.green(`Building package in ${packageDir}...`));
    runCommand("npm run build", packageDir);
  } catch (error) {
    console.error(chalk.red("Error in building package", error.message));
  }
}

async function publishPackage(packageName, version) {
  try {
    const packageDir = packageDirs[packageName].path;

    console.log(chalk.green(`Publishing package ${packageName} with version ${version}...`));

    runCommand(`npm version ${version} --no-git-tag-version`, packageDir);

    buildPackage(packageDir);

    console.log(chalk.green(`Publishing ${packageName}...`));

    const tags= (version.includes("alpha")? "--tag alpha": version.includes("beta")? "--tag beta": "")
    // Check in console that you're logged in npm. Please run npm whoami to check you're logged in/
    //console.log(`npm publish --access=public ${tags}`, packageDir);
    runCommand(`npm publish --access=public ${tags}`, packageDir);

    console.log(chalk.green(`Package ${packageName} published successfully!`));
  } catch (error) {
    console.error(chalk.red("Error Publishing individual package", error.message));
  }
}

async function publishLinter(versionEslint, versionStylelint, versionLinter) {
  try {
    updateDependenciesInLinter(versionEslint, versionStylelint);

    await publishPackage("linter", versionLinter);
  } catch (error) {
    console.error(chalk.red("Error in Publishing Linter", error.message));
  }
}

async function publishPackages() {
  try {
    const githubToken = process.env.GH_TOKEN;
    if (!githubToken) {
      // throw new Error("Github Token is missing!");
      // process.exit();
    }
    const versionLinter = await promptVersion("linter");

    const publishTasks = [
      publishPackage("eslint", versionLinter),
      publishPackage("stylelint", versionLinter),
    ];

    await Promise.all(publishTasks);

    await publishLinter(versionLinter, versionLinter, versionLinter);

    console.log(chalk.green("All packages published successfully!"));

    //Packing
    console.log(chalk.green("Packing.."));
    const tgzPath = packPackage(packageDirs["linter"].path, versionLinter);

    //Create a github release
    // console.log("Creating github release...");
    //     await createGitHubRelease(tgzPath);
  } catch (error) {
    console.error(chalk.red("Error in publishing packages", error.message));
  } finally {
    rl.close();
  }
}

publishPackages();
