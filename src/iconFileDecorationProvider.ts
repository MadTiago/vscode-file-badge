import { window, workspace, Disposable, CancellationToken, FileDecoration, FileDecorationProvider, ProviderResult, Uri, Event, EventEmitter, ThemeColor } from 'vscode';

export class IconFileDecorationProvider implements FileDecorationProvider {

	private disposables: Array<Disposable> = [];

	private _decoratedFiles: Map<string, boolean> = new Map<string, boolean>();

	private readonly _onDidChangeFileDecorations: EventEmitter<Uri | Uri[]> = new EventEmitter< Uri | Uri[]>();
	readonly onDidChangeFileDecorations: Event<Uri | Uri[]> = this._onDidChangeFileDecorations.event;

	constructor() {
		this.disposables = [];
		this.disposables.push(window.registerFileDecorationProvider(this));
	}
	
	provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration> {
		if(this._decoratedFiles.get(uri.fsPath)){
			let configuration = workspace.getConfiguration("fileBadge");
			return new FileDecoration(configuration.get("badge"), configuration.get("tooltip"), new ThemeColor("fileBadge.treeItemTextForeground"));
		}
		return undefined;
	}

	updateTreeFileDecoration(resourceUri: Uri): void {
		const oldValue = this._decoratedFiles.get(resourceUri.fsPath);
		this._decoratedFiles.set(resourceUri.fsPath, oldValue === undefined ? true : !oldValue);
		this._onDidChangeFileDecorations.fire(resourceUri);
	}

	dispose() {
		this.disposables.forEach((d) => d.dispose());
	}
}