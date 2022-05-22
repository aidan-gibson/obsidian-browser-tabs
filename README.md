## TODO

- [ ] settings.ts add one setting just to justify the settings page
- [ ] should anything be try/catch?
- [ ] automated tests

## Deets

Insert GIF/Video here of functionality.

Pasting 2+ links results in a collapsed callout named "Links" to be automatically generated with an "Open" button, which
will automatically open the links within.

I'm using :// for link recognition, as I want it to work for deeplinks like `obsidian://open?vault=test` as well.

Only developing for Live Preview on Desktop.

Recommended Workflow:
Use [Copy All Urls](https://chrome.google.com/webstore/detail/copy-all-urls/djdmadneanknadilpjiknlnanaolmbfk?hl=en)
Chrome Plugin, hit `Alt+c` to copy all links from window to clipboard, paste them in Obsidian. Use chrome:
//extensions/shortcuts to change this shortcut.

## Install

Unzip into `.obsidian/plugins`.

Contributions are welcome. Follow build instructions below.

## Build

Clone into `.obsidian/plugins` testing vault.

Node.js is javascript runtime enviro.

npm is package manager for Node.js
`npm i` aka `npm install` downloads all packages listed as dependencies in package.json.

Run `npm i`.

`npm run dev` compiles main.ts -> main.js, live-updates as you code.

Use Hot Reload Obsidian plugin in test vault, which will auto-reload plugins when their files are changed.

## Releasing new releases

For updates to the Obsidian API run `npm update` under your repo folder.

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required
  for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian
  can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't
  include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be
  in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major`
> after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version
> to `versions.json`

## Adding your plugin to the community plugin list TODO

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)

- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against
  your plugin to find common bugs and ways to improve your code.
- To use eslint with this project, make sure to install eslint from terminal:
	- `npm install -g eslint`
- To use eslint to analyze this project use this command:
	- `eslint main.ts`
	- eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that
  folder:
	- `eslint .\src\`

## API Documentation

See https://github.com/obsidianmd/obsidian-api
