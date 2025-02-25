// src/utils/editorLinkUtil.ts

import chalk from 'chalk';

/**
 * Returns an editor-specific link for opening a file at a given line and column.
 *
 * @param editor - The editor to use (e.g., 'vscode', 'atom', 'sublime').
 * @param absolutePath - The absolute path to the file.
 * @param line - The line number in the file.
 * @param column - The column number in the file.
 * @returns A URL string that can be used to open the file in the specified editor.
 */
export function getEditorLink(
  editor: string,
  absolutePath: string,
  line: number,
  column: number
): string {
  if (editor === 'vscode') {
    return `vscode://file/${absolutePath}:${line}:${column}`;
  } else if (editor === 'atom') {
    return `atom://core/open/file?filename=${absolutePath}&line=${line}&column=${column}`;
  } else if (editor === 'sublime') {
    // Sublime Text does not have a standard URL scheme.
    return `file://${absolutePath}:${line}:${column}`;
  } else {
    // Fallback to a standard file URL.
    return `file://${absolutePath}:${line}:${column}`;
  }
}

/**
 * Creates an ANSI hyperlink (if supported) for the line:column text.
 *
 * @param lineCol - The line:column string (e.g., "10:5").
 * @param absolutePath - The absolute path to the file.
 * @param line - The line number in the file.
 * @param column - The column number in the file.
 * @param editor - The editor to use (e.g., 'vscode', 'atom', 'sublime').
 * @returns A string with ANSI escape sequences to create a clickable hyperlink.
 */
export function createClickableLineCol(
  lineCol: string,
  absolutePath: string,
  line: number,
  column: number,
  editor: string
): string {
  const link = getEditorLink(editor, absolutePath, line, column);
  return `\u001b]8;;${link}\u0007${chalk.blueBright(lineCol)}\u001b]8;;\u0007`;
}
