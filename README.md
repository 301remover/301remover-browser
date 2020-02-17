# browser-extension

### How to load the extension on Firefox (dev)
1. Open Terminal
2. Open the directory containing your extension's files, using the command `cd path/to/my-extension/`
3. ZIP the content of the directory—remembering to excludes those files that aren’t needed to run the extension, such as .git, graphic sources, and similar files—using the command `zip -r -FS ../my-extension.zip * --exclude *.git*`
4. Open Firefox
5. Naviage to about:addons
6. Click on the gear
7. Select **"Install Add-on from File..."**
8. Using the File Dialog select the new .zip from before
9. Agree to the corresponding prompts that appear after loading the .zip file

For reference: [How to Package your Extension](https://extensionworkshop.com/documentation/publish/package-your-extension/)


### How to load the extension on Chrome (dev)
1. Open Chrome
2. Naviagate to chrome://extensions/
3. Use 'Load Unpacked' and select the 'browser-extension' folder
4. It should now be loaded and activated
