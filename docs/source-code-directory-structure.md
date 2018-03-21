# Source Code Directory Structure


## Structure of Source Code

The source code mostly follow [Angular File structure conventions](https://angular.io/guide/styleguide#file-structure-conventions).


```
geeks-diary/src/
├── app/ - Renderer process code. Based on angular style guide.
|   ├── core/ - App core module.
|   ├── shared/ - App shared module.
|   └── ...other features
|
├── assets/ - Images, vendors, stylesheets, etc.
├── common/ - Code that used by both the main and renderer processes.
├── electron/ - Main process code.
├── environments/ - Environment configurations.
├── resources/ - Icons, platform-dependent files, etc.
├── styles/ - Global stylesheets.
├── testing/ - Testing utilities.
├── index.html - Main end point of browser window.
├── main.borwser.ts - Main end point of browser window.
├── main.electron.ts - Main end point of browser window.
└── spec.ts - Automatic tests index.
``` 


## Structure of Other Directories

* **configs** - Configurations for development purpose like bundling, building, packaging, etc.
* **tools** - Helper scripts for development.
* **node_modules** - Third party node modules used for building.
* **dist** - Temporary directory created by webpack.  
