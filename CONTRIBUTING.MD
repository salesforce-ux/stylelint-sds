# Contributing Guidelines

Thank you for considering contributing to our repository! Your contributions help improve our project and make it more valuable for everyone.

## BEFORE YOU CONTRIBUTE:

Create a new issue before starting your project so that we can keep track of what you are trying to add/fix. That way, we can also offer suggestions or let you know if there is already an effort in progress.

## Contributing

1. Fork this repository.
2. Create a _topic_ branch in your fork based on the correct branch (the **main** branch, see [Branches section](#branches) below). Note, this step is recommended but technically not required if contributing using a fork.
3. Edit the code in your fork.
4. Sign CLA (see [CLA](#cla) below)
5. For local setup, please see [Local Setup](#local-setup). Send us a pull request when you are done. We'll review your code, suggest any
   needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

## Branches

- Our released (aka. _production_) branch is `main`.
- Our work happens in _topic_ branches (feature and/or bug-fix).
  - feature as well as bug-fix branches are based on `main`
  - branches _should_ be kept up-to-date using `rebase`
  - see below for further merge instructions

### Merging between branches

- We try to limit merge commits as much as possible.

  - They are usually only ok when done by our release automation.

- _Topic_ branches are:

  1. based on `main` and will be
  1. squash-merged into `main`.

- Hot-fix branches are an exception.
  - Instead we aim for faster cycles and a generally stable `main` branch.

## Pull Requests

- Develop features and bug fixes in _topic_ branches.
- _Topic_ branches can live in forks (external contributors) or within this repository (committers).
  \*\* When creating _topic_ branches in this repository please prefix with `<developer-name>/`.
- After thorough testing, raise a Pull Request (PR) for review.
- Include a clear description of the changes made in the PR description.
- Our team will review your changes and provide feedback as needed.

## Local Setup

### Pre-requisites

SLDS Linter CLI tool works best with the [Active LTS](https://nodejs.org/en/about/previous-releases) version of Node.js.  

#### **Minimum Required Node.js Version**  
- The minimum supported Node.js version is **v20.18.3**.  
- We recommend using the latest **Active LTS** release for the best performance and compatibility. 
- The tool verifies the Node.js version at the beginning of the process. If the Node.js requirements are met, the subsequent steps will proceed smoothly.

### Development Steps
- Run `yarn` to install all the dependencies.
- Run `yarn build` to build all the workspaces.
- Run `cd packages/slds-linter` to change the directory to slds-linter.
- Run `npm link .` to create a symbolic link to the current local package, allowing you to use it globally or in other projects without needing to publish it.
- Run `cd ../..` to change to the root directory.
- Run the slds-linter commands to lint the files in `demo`. Please see [Command-Line Interface(CLI)](https://github.com/salesforce-ux/slds-linter/tree/main/packages/slds-linter#command-line-interface-cli) for more details.
- Locally, the command `npx @salesforce-ux/slds-linter` can be used interchangeably with `slds-linter`. For instance, `npx @salesforce-ux/slds-linter --help` can be executed as `slds-linter --help`, and this applies to all other commands as well.

### Merging Pull Requests

- Pull request merging is restricted to squash & merge only.

Happy contributing!