import {
    window,
    workspace,
    Disposable,
    CancellationToken,
    FileDecoration,
    FileDecorationProvider,
    ProviderResult,
    Uri,
    Event,
    EventEmitter,
    ThemeColor,
    ExtensionContext,
} from "vscode";
import { Icon } from "./interface/icon";

export class IconFileDecorationProvider implements FileDecorationProvider {
    private readonly _onDidChangeFileDecorations: EventEmitter<Uri | Uri[]> = new EventEmitter<Uri | Uri[]>();
    readonly onDidChangeFileDecorations: Event<Uri | Uri[]> = this._onDidChangeFileDecorations.event;
    private disposables: Array<Disposable> = [];

    private _context: ExtensionContext;
    private readonly _icons: Array<Icon>;
    // Map of current decorations <fsPath, array of icon names>
    private _decoratedFiles: Map<string, string[]> = new Map<string, string[]>();

    constructor(context: ExtensionContext, icons: Array<Icon>) {
        this.disposables = [];
        this.disposables.push(window.registerFileDecorationProvider(this));
        this._context = context;
        this._icons = icons;
        this.populatePreviousSessionState();
    }

    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        const decorations = this._decoratedFiles.get(uri.fsPath);
        if (!decorations) {
            return undefined;
        }
        const configuration = workspace.getConfiguration("fileBadge");

        // Build the badge
        let badge = "";
        decorations.forEach((iconName) => {
            const iconIndex = this._icons.findIndex((icon) => icon.name === iconName);
            badge += this._icons[iconIndex].icon;
        });

        return new FileDecoration(
            //configuration.get("badge"),
            badge,
            configuration.get("tooltip"),
            new ThemeColor("fileBadge.treeItemTextForeground")
        );
    }

    updateTreeFileDecoration(resourceUri: Uri, iconName: string): void {
        // Do we have decorations?
        const decorations = this._decoratedFiles.get(resourceUri.fsPath);

        // Update decorations Map
        if (decorations === undefined) {
            this._decoratedFiles.set(resourceUri.fsPath, [iconName]);
        } else {
            // This file already has decorations,
            // are we adding another or removing an existing one?
            const indexOfDecoration = decorations.indexOf(iconName);
            if (indexOfDecoration === -1) { // Adding icon
                if(decorations.length < 2){
                    decorations.push(iconName);
                } else {
                    // We can only show a max of 2 badges, warn the user
                    window.showInformationMessage("FileBadge: You can only have 2 badges.");
                }
            } else { // Removing icon
                decorations.splice(indexOfDecoration, 1);
                if(decorations.length === 0){
                    this._decoratedFiles.delete(resourceUri.fsPath);
                }
            }
            // Unnecessary to set _decoratedFiles, since we got a reference for "decorations" array
            //this._decoratedFiles.set(resourceUri.fsPath, decorations);
        }
        this.saveSessionState();

        // Notify FileDecorationProvider
        this._onDidChangeFileDecorations.fire(resourceUri);
    }

    removeAllTreeFileDecorations(resourceUri: Uri) {
        if(this._decoratedFiles.delete(resourceUri.fsPath)) {
            this.saveSessionState();
            this._onDidChangeFileDecorations.fire(resourceUri);
        }
    }

    saveSessionState(): void {
        // Convert Map to plain object to save
        const serializedState = Object.fromEntries(this._decoratedFiles);
        // Save workspace state
        this._context.workspaceState.update("fileBadgeState", serializedState);
    }

    populatePreviousSessionState() {
        // Get current workspace fileBadge state
        const fileBadgeState = this._context.workspaceState.get<Record<string, string[]>>("fileBadgeState", {});

        // Convert Object to Map and iterate over previous session state
        Object.entries(fileBadgeState).forEach(([fsPath, decorations]) => {
            decorations.forEach(iconName => {
                this.updateTreeFileDecoration(Uri.file(fsPath), iconName);
            });
        });
    }

    dispose() {
        this.disposables.forEach((d) => d.dispose());
    }
}
