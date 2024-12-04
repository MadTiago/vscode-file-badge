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

export class IconFileDecorationProvider implements FileDecorationProvider {
    private disposables: Array<Disposable> = [];

    private _decoratedFiles: Map<string, boolean> = new Map<string, boolean>();

    private readonly _onDidChangeFileDecorations: EventEmitter<Uri | Uri[]> = new EventEmitter<Uri | Uri[]>();
    readonly onDidChangeFileDecorations: Event<Uri | Uri[]> = this._onDidChangeFileDecorations.event;

    constructor(context: ExtensionContext) {
        this.disposables = [];
        this.disposables.push(window.registerFileDecorationProvider(this));
        this.populatePreviousSessionState(context);
    }

    provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
        if (this._decoratedFiles.get(uri.fsPath)) {
            let configuration = workspace.getConfiguration("fileBadge");
            return new FileDecoration(
                configuration.get("badge"),
                configuration.get("tooltip"),
                new ThemeColor("fileBadge.treeItemTextForeground")
            );
        }
        return undefined;
    }

    updateTreeFileDecoration(context: ExtensionContext, resourceUri: Uri): void {
        // Is it tagged?
        const oldValue = this._decoratedFiles.get(resourceUri.fsPath);
        // Toggle tag
        this._decoratedFiles.set(resourceUri.fsPath, oldValue === undefined ? true : !oldValue);
        // Convert Map to plain object to save
        const serializedState = Object.fromEntries(this._decoratedFiles);
        // Save workspace state
        context.workspaceState.update("fileBadgeState", serializedState);
        // Notify FileDecorationProvider
        this._onDidChangeFileDecorations.fire(resourceUri);
    }

    populatePreviousSessionState(context: ExtensionContext) {
        // Get current workspace fileBadge state
        const fileBadgeState = context.workspaceState.get<Record<string, boolean>>("fileBadgeState", {});

        // Convert Object to Map and iterate over previous session state
        Object.entries(fileBadgeState).forEach(([fsPath, tagged]) => {
            if (tagged === true) {
                this.updateTreeFileDecoration(context, Uri.file(fsPath));
            }
        });
    }

    dispose() {
        this.disposables.forEach((d) => d.dispose());
    }
}
