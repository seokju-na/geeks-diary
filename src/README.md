# Geeks Diary Sources

## File structure overview

```
src/
├── assets/ - Images, Vendor scripts, Icons, etc.
├── browser/ - Renderer process layer in electron.
|   ├── (Feature Modules) - Feature module entries. 
|   ├── shared/ - Shared module 
|   └── ui/ - UI module
|
├── core/ - Domain related core sources
├── libs/ - Libraries that can be used in common by other layers.
└── main-process/ - Main process layer in electron.
    ├── services/ - Services communicate with renderer layer. Usaully handles IPC events.
    ├── windows/ - Browser window implements.
    ├── app-delegate.ts - Electron app delegation.
    └── main.ts - Entry point for main process.
```


## Structuring folders and files
### Browser

* Use ``index.ts`` for shorthand path.
* One folder per one module. This is clean.


### Core, Libraries

* Flatten files.


### Main Process

* Use ``index.ts`` for shorthand path.
