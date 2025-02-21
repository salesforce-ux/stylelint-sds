# Contributing Guidelines

Thank you for considering contributing to our repository! Your contributions help improve our project and make it more valuable for everyone.

## BEFORE YOU CONTRIBUTE:

Create a new issue before starting your project so that we can keep track of what you are trying to add/fix. That way, we can also offer suggestions or let you know if there is already an effort in progress.

## Contributing

1. Fork this repository.
2. Create a _topic_ branch in your fork based on the correct branch (the **main** branch, see [Branches section](#branches) below). Note, this step is recommended but technically not required if contributing using a fork.
3. Edit the code in your fork.
4. Sign CLA (see [CLA](#cla) below)
5. Send us a pull request when you are done. We'll review your code, suggest any
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

- Run `npm run clean` to clear or reset build and dependency-related files to ensure a clean slate for the next build or process.
- Run `npm run install-all` to install all the dependencies.
- Run `npm run build` to build all the workspaces.
- Run the slds-linter commands to lint the files in `test-repository`. Please see [Command-Line Interface(CLI)](https://github.com/salesforce-ux/stylelint-sds/tree/main/packages/slds-linter#command-line-interface-cli) for more details.

### Merging Pull Requests

- Pull request merging is restricted to squash & merge only.

Happy contributing!