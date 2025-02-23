# Linting CLI Tool

A powerful command-line tool for linting styles and components with support for parallel processing and SARIF report generation.

## Features

- 🚀 Parallel processing for maximum performance
- 📊 SARIF report generation
- 🔧 Support for both stylelint and eslint
- ⚡ Batch processing for large codebases
- 🛠️ Auto-fixing capabilities
- 📝 Detailed logging and error reporting

## Installation
```bash
npm install -g linting-cli
```

## Usage

### Basic Commands

Run style linting
```bash
linting-cli lint:styles -d ./src -o ./reports
```

Run component linting
```bash
linting-cli lint:components -d ./src -o ./reports
```

Run both style and component linting
```bash
linting-cli lint -d ./src -o ./reports
```

Generate SARIF reports
```bash
linting-cli report -d ./src -o ./reports    
```

### Command Options

#### Common Options
- `-d, --directory <path>`: Target directory to scan (defaults to current directory)
- `-o, --output <path>`: Output directory for reports (defaults to current directory)
- `--fix`: Automatically fix problems when possible

#### Lint Commands
- `--config <path>`: Path to linter config file (for single linter commands)
- `--config-style <path>`: Path to stylelint config file (for combined lint command)
- `--config-eslint <path>`: Path to eslint config file (for combined lint command)

## Configuration

The tool respects existing configuration files:
- `.stylelintrc.*` for style linting
- `.eslintrc.*` for component linting

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


