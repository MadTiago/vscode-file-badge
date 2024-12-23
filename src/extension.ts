import { commands, ExtensionContext, Uri, workspace } from "vscode";
import { IconFileDecorationProvider } from "./iconFileDecorationProvider";
import { Icon } from "./interface/icon";

export function activate(context: ExtensionContext) {
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
        let disposable = commands.registerCommand(icon.command, async (...commandArgs) => {
            commandArgs[1].forEach((uri: Uri) =>
                iconTreeFileDecoration.updateTreeFileDecoration(uri, icon.name)
            );
        });
        context.subscriptions.push(disposable);
    });

    // Register removeAll command
    let disposable = commands.registerCommand("file-badge.tagFile.removeAll", async (...commandArgs) => {
        commandArgs[1].forEach((uri: Uri) =>
            iconTreeFileDecoration.removeAllTreeFileDecorations(uri)
        );
    });
    context.subscriptions.push(disposable);

    // Subscribe to onDidRenameFiles from the workspace
    const onFileRenameDisposable = workspace.onDidRenameFiles(event => {
        event.files.forEach(({ oldUri, newUri }) => {
            let oldUriDecorations = iconTreeFileDecoration.getCurrentUriDecorations(oldUri);
            // Move decorations from oldUri to newUri
            if(oldUriDecorations !== undefined){
                iconTreeFileDecoration.removeAllTreeFileDecorations(oldUri);
                oldUriDecorations.forEach((iconName) => {
                    iconTreeFileDecoration.updateTreeFileDecoration(newUri, iconName);
                });
            }
        });
    });
    context.subscriptions.push(onFileRenameDisposable);

    // Subscribe to onDidDeleteFiles from the workspace
    const onFileDeleteDisposable = workspace.onDidDeleteFiles(event => {
        event.files.forEach((uri) => {
            let deletedUriDecorations = iconTreeFileDecoration.getCurrentUriDecorations(uri);
            if(deletedUriDecorations !== undefined) {
                iconTreeFileDecoration.removeAllTreeFileDecorations(uri);
            }
        });
    });
    context.subscriptions.push(onFileDeleteDisposable);
}

export function deactivate() {}
