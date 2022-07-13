import {
	//App,
	Editor,
	MarkdownView,
	//Modal,
	//Notice,
	Plugin,
	//PluginSettingTab,
	//Setting,
} from "obsidian";
import {
	BrowserTabsSettings,
	BrowserTabsSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";

interface PasteFunction {
	(this: HTMLElement, ev: ClipboardEvent): void;
}

interface Click {
	(this: HTMLElement, ev: MouseEvent): void;
}

export default class BrowserTabs extends Plugin {
	settings: BrowserTabsSettings;
	pasteFunction: PasteFunction;
	click: Click;

	async onload() {
		console.log("loading obsidian-browser-tabs");
		await this.loadSettings();

		// Listen to paste event
		this.pasteFunction = this.pasteUrlList.bind(this);

		this.registerEvent(
			this.app.workspace.on("editor-paste", this.pasteFunction) //TODO obsid docs for "editor-paste" specify further instructions
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BrowserTabsSettingTab(this.app, this));

		//end paste part, begin opener part

		// listen to click event
		this.click = this.openUrlList.bind(this);

		this.registerEvent(this.app.workspace.on("click", this.click));
	}

	async openUrlList(mouse: MouseEvent): Promise<void> {
		// console.log("click");
		// const match: string = '<div class="callout-title-inner">Links</div>';

		const clickTarget = mouse.target as HTMLElement; //so intellisense will work (errors show up in IDE if I don't say as HTMLElement

		if (
			clickTarget.hasClass("callout-title-inner") &&
			clickTarget.innerText == "Links"
		) {
			mouse.stopPropagation(); //vs stop immediate prop?
			mouse.preventDefault();
			if (
				clickTarget.parentNode != null &&
				clickTarget.parentNode.parentNode != null
			) {
				const calloutContent =
					clickTarget.parentNode.parentNode.querySelector(
						'[class="callout-content"]'
					); //within <p> all links there
				if (calloutContent != null) {
					const linksToOpen = calloutContent.querySelectorAll(
						'[class="external-link"]'
					);
					linksToOpen.forEach(function (curr) {
						//console.log(curr.innerHTML);
						window.open(curr.innerHTML);
					});
				}
			}
		}
	}

	async pasteUrlList(clipboard: ClipboardEvent): Promise<void> {
		const editor = this.getEditor();
		if (!editor) return;
		if (clipboard.clipboardData == null) {
			//console.log("clipboard.clipboardData==null");
			return;
		}
		const clipboardText = clipboard.clipboardData.getData("text/plain");
		const lineBrk = /[\r\n]/.exec(clipboardText); //if \r or \n NOT there, lineBrk == null and it's one line
		if (clipboardText == null || clipboardText == "" || lineBrk == null)
			return; //if no lineBrk, leave. I don't want it to activate for one link

		// at this point we've established clipboardText > 1 line
		// for each line, check if THAT LINE contains :// aka /:\/\// in regex

		const lines = clipboardText.split("\n");
		for (let i = 0; i < lines.length; i++) {
			// const checkLink = /:\/\//.exec(lines[i]); //if checkLink is null, :// wasn't found
			const checkLink = /^(?!\s)(?:[^\s:]+:\/\/)+[^\s]*$/.exec(lines[i]);
			if (checkLink == null && lines[i] != "" && lines[i] != "\n") {
				//don't do it if there wasn't a :// with exception of empty line or \n
				//console.log(
				//	"2+ lines, but a non-empty line !=\n doesn't have ://"
				//); //empty lines or lines with \n are acceptable
				return; //if :// wasn't found AND it wasn't an empty line or a \n, cancel this entire function, it isn't a valid url list
			}
		}
		//console.log("Valid URL List."); //now surround it with button whatever
		// We've decided to handle the paste, stop propagation to the default handler.
		clipboard.stopPropagation();
		clipboard.preventDefault();
		let newPaste = "\n>[!LINKS]-\n";
		for (let i = 0; i < lines.length; i++) {
			if (lines[i] != "" && lines[i] != "\n") {
				newPaste += "> [" + lines[i] + "](" + lines[i] + ")" + "\n";
			}
		}
		editor.replaceSelection(newPaste);
	}

	onunload() {
		console.log("unloading obsidian-browser-tabs");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private getEditor(): Editor | null {
		const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeLeaf == null) return null;
		return activeLeaf.editor;
	}
}
