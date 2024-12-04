import * as vscode from "vscode";
import { IconFileDecorationProvider } from "./iconFileDecorationProvider";

export function activate(context: vscode.ExtensionContext) {
    const iconTreeFileDecoration = new IconFileDecorationProvider(context);

    let disposable = vscode.commands.registerCommand("file-badge.tagFile", async (...commandArgs) => {
        commandArgs[1].forEach((uri: vscode.Uri) => iconTreeFileDecoration.updateTreeFileDecoration(context, uri));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
