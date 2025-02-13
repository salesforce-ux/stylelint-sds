import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CLI arguments
const args = process.argv.slice(2);
const dirArgIndex = args.indexOf("--dir");

// If --dir is provided, use the next argument; otherwise, default to "force-app/"
const targetDir = dirArgIndex !== -1 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "force-app/";

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const eslintConfigPath = path.resolve(process.cwd(), '.eslintrc.yml');
const stylelintConfigPath = path.resolve(process.cwd(), '.stylelintrc.yml');
const eslintExtendConfig = "./node_modules/@salesforce-ux/slds-linter/build/.eslintrc.yml";
const stylelintExtendConfig = "./node_modules/@salesforce-ux/slds-linter/build/.stylelintrc.yml";

// Required linting scripts with dynamic directory handling
const requiredScripts: Record<string, string> = {
    "lint:styles": `stylelint ./**/*.css --config=.stylelintrc.yml`,
    "lint:components": `eslint ./**/*.{html,cmp} --ext .html,.cmp --config=.eslintrc.yml`,
    "lint": "npm run lint:components && npm run lint:styles",
    "fix": `stylelint ./**/*.css -c .stylelintrc.yml --fix`,
    "report": `node node_modules/@salesforce-ux/stylelint-sds/build/report.js ${targetDir} -c .stylelintrc.yml`,
    "setup-lint": "node ./node_modules/@salesforce-ux/sds-linter/build/setup.js"
};

// Configuration files to be copied
const configFiles = [
    {
        sourcePath: path.resolve(__dirname, './.eslintrc.yml'),
        destinationPath: eslintConfigPath,
        name: '.eslintrc.yml',
        extendsConfig: eslintExtendConfig
    },
    {
        sourcePath: path.resolve(__dirname, './.stylelintrc.yml'),
        destinationPath: stylelintConfigPath,
        name: '.stylelintrc.yml',
        extendsConfig: stylelintExtendConfig
    }
];

// **Step 1: Inject missing scripts into package.json**
function updatePackageJson() {
    if (!fs.existsSync(packageJsonPath)) {
        console.error('❌ Error: package.json not found. Ensure you are running this inside a Node.js project.');
        process.exit(1);
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.scripts = packageJson.scripts || {};

    let scriptsAdded = false;

    Object.keys(requiredScripts).forEach(script => {
        if (!packageJson.scripts[script]) {
            packageJson.scripts[script] = requiredScripts[script];
            scriptsAdded = true;
        }
    });

    // If any new script was added, update package.json
    if (scriptsAdded) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Linting scripts added to package.json (existing scripts remain unchanged).');
    } else {
        console.log('✅ All required linting scripts are already present in package.json.');
    }
}

// **Step 2: Copy or Modify ESLint & Stylelint Configuration Files**
function setupLintConfig() {
    configFiles.forEach(({ sourcePath, destinationPath, name, extendsConfig }) => {
        if (!fs.existsSync(destinationPath)) {
            try {
                fs.copyFileSync(sourcePath, destinationPath);
                console.log(`✅ ${name} has been successfully created.`);
            } catch (error) {
                console.error(`❌ Error copying ${name}:`, error);
            }
        } else {
            let fileContent = fs.readFileSync(destinationPath, 'utf-8');

            // If "extends" is missing, add it
            if (!fileContent.includes("extends:")) {
                fileContent = `extends:\n  - "${extendsConfig}"\n` + fileContent;
                fs.writeFileSync(destinationPath, fileContent, 'utf-8');
                console.log(`✅ Updated ${name} to include extends: ${extendsConfig}`);
            } else {
                console.log(`⚠️ ${name} already exists and has extends. Merge configurations manually if needed.`);
            }
        }
    });
}

// **Step 3: Display Onboarding Summary**
function showOnboardingMessage() {
    console.log("\n------------------------------------------------------");
    console.log("🚀 SLDS Linter Setup Complete! 🚀\n");
    console.log("Here’s what was set up for you:");
    console.log("✔ ESLint configuration: .eslintrc.yml");
    console.log("✔ Stylelint configuration: .stylelintrc.yml");
    console.log("✔ Linting scripts added to package.json\n");
    console.log("🔧 Usage Guide:");
    console.log(`- Run \`npm run lint\` to lint your files.`);
    console.log(`- Run \`npm run fix\` to auto-fix linting issues.`);
    console.log(`- Run \`npm run report --dir <your-folder>\` to generate a linting report for a specific folder.`);
    console.log(`  (Default: force-app/ → Currently set to "${targetDir}")`);
    console.log(`- Run \`npm run setup-lint\` to reconfigure settings.\n`);
    console.log("⚠ If you already had linting config files, they were updated to extend the shared config.");
    console.log("------------------------------------------------------\n");
}

// Run setup steps
updatePackageJson();
setupLintConfig();
showOnboardingMessage();
