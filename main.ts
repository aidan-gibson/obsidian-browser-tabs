import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {
	BrowserTabsSettings,
	BrowserTabsSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { CheckIf } from "checkif";
// Remember to rename these classes and interfaces!

interface PasteFunction {
	(this: HTMLElement, ev: ClipboardEvent): void;
}


export default class BrowserTabs extends Plugin {
	settings: BrowserTabsSettings;
	pasteFunction: PasteFunction;

	async onload() {
		this.registerInterval(
			window.setInterval(this.injectButtons.bind(this), 1000)
		);


		console.log("loading obsidian-browser-tabs")
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

	injectButtons(){
		this.addCopyButtons();
	}

	addCopyButtons(){
		const links_callouts = document.querySelectorAll('[data-callout="links"]');
		links_callouts.forEach(function (curr){
			const button = document.createElement('button');
			button.className = 'open-links-button';
			button.type = 'button';
			button.innerText = 'Open';
			button.addEventListener('click', function(){
				console.log("Click");
			});
			//curr.append(button); TODO race condition, just keeping adding. so this just keeps running...addCopyButtons needs to only run once on paste and once on page load...

		});
	}



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
		let i;
		let editor = this.getEditor();
		if (!editor) return;
		let clipboardText = clipboard.clipboardData.getData("text/plain");
		const line_br = /\r|\n/.exec(clipboardText); //if \r or \n NOT there, line_br == null and it's one line
		if (clipboardText == null || clipboardText == "" || line_br == null) return; //if no line_br, leave. I don't want it to activate for one link

		// at this point we've established clipboardText > 1 line
		// for each line, check if THAT LINE contains :// aka /:\/\// in regex

		var lines = clipboardText.split('\n');
		for(i = 0; i < lines.length; i++){
			const check_link = /:\/\//.exec(lines[i]); //if check_link is null, :// wasn't found
			if (check_link == null && lines[i]!=""&& lines[i]!="\n") {
				console.log("2+ lines, but a non-empty line !=\n doesn't have ://");
				return;//if :// wasn't found AND it wasn't an empty line or a \n, cancel this entire function, it isn't a valid url list
			}

		}
		console.log("Valid URL List."); //now surround it with button whatever
		// We've decided to handle the paste, stop propagation to the default handler.
		clipboard.stopPropagation();
		clipboard.preventDefault();
		let new_paste = ">[!LINKS]-\n";
		for(i = 0; i< lines.length; i++){
			if (lines[i]!="" && lines[i]!="\n") {
				new_paste += ">" + lines[i] + "\n";
			}
		}
		editor.replaceSelection(new_paste);
	}

	private getEditor(): Editor {
		let activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeLeaf == null) return;
		return activeLeaf.editor;
	}

	onunload() {
		console.log("unloading obsidian-browser-tabs");

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
