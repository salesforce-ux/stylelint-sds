import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import boxen from 'boxen';
import yaml from 'js-yaml';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const eslintConfigPath = path.resolve(process.cwd(), '.eslintrc.yml');
const stylelintConfigPath = path.resolve(process.cwd(), '.stylelintrc.yml');
const eslintExtendConfig = "./node_modules/@salesforce-ux/slds-linter/build/.eslintrc.yml";
const stylelintExtendConfig = "./node_modules/@salesforce-ux/slds-linter/build/.stylelintrc.yml";

// Required linting scripts
const requiredScripts = {
    "lint:styles": "stylelint ./**/*.css --config=.stylelintrc.yml",
    "lint:components": "eslint ./**/*.{html,cmp} --ext .html,.cmp --config=.eslintrc.yml",
    "lint": "npm run lint:components && npm run lint:styles",
    "fix": "stylelint ./**/*.css -c .stylelintrc.yml --fix",
    "report": "node node_modules/@salesforce-ux/stylelint-sds/build/report.js force-app/ -c .stylelintrc.yml",
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
        console.error(chalk.red('❌ Error: package.json not found. Ensure you are running this inside a Node.js project.'));
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
        console.log(chalk.green('✅ Linting scripts added to package.json (existing scripts remain unchanged).'));
    } else {
        console.log(chalk.yellow('✅ All required linting scripts are already present in package.json.'));
    }
}

// **Step 2: Copy or Modify ESLint & Stylelint Configuration Files**
function setupLintConfig() {
    configFiles.forEach(({ sourcePath, destinationPath, name, extendsConfig }) => {
        if (!fs.existsSync(destinationPath)) {
            try {
                fs.copyFileSync(sourcePath, destinationPath);
                console.log(chalk.green(`✅ ${name} has been successfully created.`));
            } catch (error) {
                console.error(chalk.red(`❌ Error copying ${name}:`), error);
            }
        } else {
            let fileContent = fs.readFileSync(destinationPath, 'utf-8');
            let config = yaml.load(fileContent) || {};

            // If "extends" is missing, add it
            if (!config.extends) {
                config.extends = [extendsConfig];
            } else if (Array.isArray(config.extends)) {
                if (!config.extends.includes(extendsConfig)) {
                    config.extends.push(extendsConfig);
                }
            } else if (typeof config.extends === "string") {
                if (config.extends !== extendsConfig) {
                    config.extends = [config.extends, extendsConfig];
                }
            }

            fs.writeFileSync(destinationPath, yaml.dump(config), 'utf-8');
            console.log(chalk.green(`✅ Updated ${name} to include extends: ${extendsConfig}`));
        }
    });
}

// **Step 3: Display Onboarding Summary**
function showOnboardingMessage() {
    const message = `
🚀 ${chalk.bold.green('SLDS Linter Setup Complete!')} 🚀

${chalk.bold('Here’s what was set up for you:')}
${chalk.green('✔')} ESLint configuration: ${chalk.cyan('.eslintrc.yml')}
${chalk.green('✔')} Stylelint configuration: ${chalk.cyan('.stylelintrc.yml')}
${chalk.green('✔')} Linting scripts added to ${chalk.cyan('package.json')}

${chalk.bold('🔧 Usage Guide:')}
- Run ${chalk.cyan('npm run lint')} to lint your files.
- Run ${chalk.cyan('npm run fix')} to auto-fix linting issues.
- Run ${chalk.cyan('npm run report')} to generate a linting report.
- Run ${chalk.cyan('npm run setup-lint')} to reconfigure settings.

${chalk.yellow('⚠ If you already had linting config files, they were updated to extend the shared config.')}

${chalk.bold('Happy Coding! 🎉')}
`;

    console.log(boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan"
    }));
}

// Run setup steps
updatePackageJson();
setupLintConfig();
showOnboardingMessage();
