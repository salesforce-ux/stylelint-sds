import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import prompts from 'prompts';
import semver from 'semver';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function getWorkspaceInfo() {
  const output = execSync('yarn workspaces info --json').toString();
  // Remove the first and last lines that yarn adds
  const jsonStr = output.split('\n').slice(1, -2).join('\n');
  return JSON.parse(jsonStr);
}

async function validateVersion(version) {
  if (!semver.valid(version)) {
    throw new Error('Invalid version format. Please use semver format (e.g., 1.0.0)');
  }
  return true;
}

async function checkExistingTag(version) {
  try {
    return execSync(`git tag -l "${version}"`, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return false;
  }
}

async function incrementPreReleaseVersion(baseVersion, type) {
  let version = baseVersion;
  let increment = 0;
  
  while (await checkExistingTag(`${version}-${type}.${increment}`)) {
    increment++;
  }
  
  return `${version}-${type}.${increment}`;
}

async function updatePackageVersions(version, workspaceInfo) {
  for (const [pkgName, info] of Object.entries(workspaceInfo)) {
    const pkgPath = path.join(ROOT_DIR, info.location, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    
    // Update package version
    pkg.version = version;
    
    // Update workspace dependencies
    for (const dep of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!pkg[dep]) continue;
      
      for (const [depName, depVersion] of Object.entries(pkg[dep])) {
        if (workspaceInfo[depName]) {
          pkg[dep][depName] = version;
        }
      }
    }
    
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
}

async function gitOperations(version) {
  const branchName = `release/${version}`;
  
  execSync(`git checkout -b ${branchName}`);
  execSync('git add .');
  execSync(`git commit -m "Release ${version}"`);
  execSync(`git tag ${version}`);
  execSync(`git push origin ${branchName}`);
  execSync(`git push origin ${version}`);
}

async function publishPackages(workspaceInfo, version, releaseType) {
  const tag = releaseType === 'final' ? 'latest' : releaseType;
  
  for (const [pkgName, info] of Object.entries(workspaceInfo)) {
    const pkgPath = path.join(ROOT_DIR, info.location);
    execSync(`cd ${pkgPath} && npm publish --tag ${tag} --access public`);
    console.log(`Published ${pkgName}@${version}`);
  }
}

async function main() {
  try {
    // Get workspace information
    const workspaceInfo = await getWorkspaceInfo();
    
    // Prompt for version
    const { version } = await prompts({
      type: 'text',
      name: 'version',
      message: 'Enter the version number (e.g., 1.0.0):',
      validate: validateVersion
    });

    // Prompt for release type
    const { releaseType } = await prompts({
      type: 'select',
      name: 'releaseType',
      message: 'Select release type:',
      choices: [
        { title: 'Final', value: 'final' },
        { title: 'Alpha', value: 'alpha' },
        { title: 'Beta', value: 'beta' }
      ]
    });

    // Handle version generation
    let finalVersion = version;
    if (releaseType !== 'final') {
      finalVersion = await incrementPreReleaseVersion(version, releaseType);
    }

    // Update all package versions
    await updatePackageVersions(finalVersion, workspaceInfo);

    // Git operations
    await gitOperations(finalVersion);

    // Publish packages
    await publishPackages(workspaceInfo, finalVersion, releaseType);

    console.log(`\nRelease ${finalVersion} completed successfully!`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();