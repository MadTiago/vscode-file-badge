import * as vscode from "vscode";
import { IconFileDecorationProvider } from "./iconFileDecorationProvider";
import { Icon } from "./interface/icon";

export function activate(context: vscode.ExtensionContext) {
    let icons: Array<Icon> = [
        { name: "star", icon: "⭐", command: "file-badge.tagFile.star" },
        { name: "bug", icon: "🪲", command: "file-badge.tagFile.bug" },
        { name: "rocket", icon: "🚀", command: "file-badge.tagFile.rocket" },
        { name: "hammer", icon: "🔨", command: "file-badge.tagFile.hammer" },
        { name: "hot", icon: "🔥", command: "file-badge.tagFile.hot" },
        { name: "check", icon: "✔️", command: "file-badge.tagFile.check" },
        { name: "heart", icon: "❤️", command: "file-badge.tagFile.heart" },
        { name: "mindblown", icon: "🤯", command: "file-badge.tagFile.mindblown" },
    ];

    const iconTreeFileDecoration = new IconFileDecorationProvider(context, icons);

    // Register command for each icon
    icons.forEach((icon: Icon) => {
        let disposable = vscode.commands.registerCommand(icon.command, async (...commandArgs) => {
            commandArgs[1].forEach((uri: vscode.Uri) =>
                iconTreeFileDecoration.updateTreeFileDecoration(uri, icon.name)
            );
        });
        context.subscriptions.push(disposable);
    });

    // Register removeAll command
    let disposable = vscode.commands.registerCommand("file-badge.tagFile.removeAll", async (...commandArgs) => {
        commandArgs[1].forEach((uri: vscode.Uri) =>
            iconTreeFileDecoration.removeAllTreeFileDecorations(uri)
        );
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}
