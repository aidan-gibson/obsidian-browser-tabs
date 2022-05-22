import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import {
	BrowserTabsSettings,
	BrowserTabsSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";

interface PasteFunction {
	(this: HTMLElement, ev: ClipboardEvent): void;
}

export default class BrowserTabs extends Plugin {
	settings: BrowserTabsSettings;
	pasteFunction: PasteFunction;

	async onload() {
		// this.registerInterval(
		// 	window.setInterval(this.injectButtons.bind(this), 1000) //this runs every second--do not use this
		// );

		console.log("loading obsidian-browser-tabs");
		await this.loadSettings();

		// Listen to paste event
		this.pasteFunction = this.pasteUrlList.bind(this);

		this.registerEvent(
			this.app.workspace.on("editor-paste", this.pasteFunction)
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BrowserTabsSettingTab(this.app, this));
	}

	// on paste...
	// identify if list of 2+ links or not (do I surround with button or not)
	// are there 2+ lines
	// does each line have a ://

	// injectButtons(){
	// 	this.addCopyButtons();
	// }
	//
	// addCopyButtons(){
	// 	const links_callouts = document.querySelectorAll('[data-callout="links"]');
	// 	links_callouts.forEach(function (curr){
	// 		const button = document.createElement('button');
	// 		button.className = 'open-links-button';
	// 		button.type = 'button';
	// 		button.innerText = 'Open';
	// 		button.addEventListener('click', function(){
	// 			console.log("Click");
	// 		});
	// 		//curr.append(button); TODO race condition, just keeping adding. so this just keeps running...addCopyButtons needs to only run once on paste and once on page load...
	//
	// 	});
	// }

	// addCopyButtons(){
	// 	document.querySelectorAll('[data-callout="links"]').forEach(function (codeBlock){
	// 		var pre = codeBlock;//.parentNode;
	// 		// Dont add more than once
	// 		if (pre.parentNode.classList.contains('has-copy-button')) {
	// 			return;
	// 		}
	// 		pre.parentNode.classList.add( 'has-copy-button' );
	//
	// 		pre.parentNode.addEventListener('click', function() {
	// console.log("hello");
	// var links = pre.getElementsByTagName("a");
	// for(var i = 0;i<links.length;i++){
	// 	window.open(links[i].getAttribute("href"));
	// 	console.log('yo');
	// }

	// })
	// var button = document.createElement('button');

	// button.className = 'copy-code-button';
	// button.type = 'button';
	// button.innerText = 'Copy';
	//
	// button.addEventListener('click', function () {
	// 	console.log("copy");
	// 	// //pre child class "callout-content"
	// 	// let content = pre.querySelector('[class="callout-content"]');
	// 	// //window.open(url) for every url, but substring[1] to get rid of >
	// 	// content.querySelectorAll('[class="external-link"]').forEach(function(yep){
	// 	//
	// 	// });
	//
	// });
	//
	// pre.append(button);
	//pre.parentNode.append(button);

	// 	});
	// }
	// addCopyButtons(){
	// 	document.querySelectorAll('[data-callout="links"]').forEach(function (codeBlock){
	// 		var pre = codeBlock;//.parentNode;
	// 		// Dont add more than once
	// 		if (pre.parentNode.classList.contains('has-copy-button')) {
	// 			return;
	// 		}
	// 		pre.parentNode.classList.add( 'has-copy-button' );
	//
	// 		var button = document.createElement('button');
	// 		button.className = 'copy-code-button';
	// 		button.type = 'button';
	// 		button.innerText = 'Copy';
	//
	// 		button.addEventListener('click', function () {
	// 			console.log("copy");
	// 			// //pre child class "callout-content"
	// 			// let content = pre.querySelector('[class="callout-content"]');
	// 			// //window.open(url) for every url, but substring[1] to get rid of >
	// 			// content.querySelectorAll('[class="external-link"]').forEach(function(yep){
	// 			//
	// 			// });
	//
	// 		});
	//
	// 		pre.append(button);
	// 		//pre.parentNode.append(button);
	//
	//
	//
	// 	});
	// }

	async pasteUrlList(clipboard: ClipboardEvent): Promise<void> {
		const editor = this.getEditor();
		if (!editor) return;
		if (clipboard.clipboardData == null) {
			console.log("clipboard.clipboardData==null");
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
			const checkLink = /:\/\//.exec(lines[i]); //if checkLink is null, :// wasn't found
			if (checkLink == null && lines[i] != "" && lines[i] != "\n") {
				//don't do it if there wasn't a :// with exception of empty line or \n
				console.log(
					"2+ lines, but a non-empty line !=\n doesn't have ://"
				); //empty lines or lines with \n are acceptable
				return; //if :// wasn't found AND it wasn't an empty line or a \n, cancel this entire function, it isn't a valid url list
			}
		}
		console.log("Valid URL List."); //now surround it with button whatever
		// We've decided to handle the paste, stop propagation to the default handler.
		clipboard.stopPropagation();
		clipboard.preventDefault();
		let newPaste = ">[!LINKS]-\n";
		for (let i = 0; i < lines.length; i++) {
			if (lines[i] != "" && lines[i] != "\n") {
				newPaste += ">" + lines[i] + "\n";
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
