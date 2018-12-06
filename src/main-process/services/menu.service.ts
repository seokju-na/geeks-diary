import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { environment } from '../../core/environment';
import { IpcActionHandler } from '../../libs/ipc';
import { __DARWIN__ } from '../../libs/platform';
import { Service } from './service';


export class MenuService extends Service {
    constructor() {
        super('menu');
    }

    init(): void {
        const menu = Menu.buildFromTemplate(this.makeTemplate());
        Menu.setApplicationMenu(menu);
    }

    handleError(error: any): any {
    }

    @IpcActionHandler('updateNoteEditorViewMenuState')
    updateNoteEditorViewMenuState(activeMode: string): void {
        const template = this.makeTemplate();
        const viewMenu = template[__DARWIN__ ? 3 : 2];
        const noteViewMenu = viewMenu.submenu[3];

        noteViewMenu.submenu.forEach((menuItem) => {
            menuItem.checked = menuItem.id === activeMode;
        });

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    /**
     * Make template for menu.
     * It's not sure...
     *
     * macOS:
     * | Geeks Diary | File | Edit | View | Repository | Snippet | Window | Help |
     *
     * Windows:
     * | File | Edit | View | Repository | Snippet | Help |
     */
    private makeTemplate(): MenuItemConstructorOptions[] {
        const template: MenuItemConstructorOptions[] = [];
        const separator: MenuItemConstructorOptions = { type: 'separator' };

        const ipc = this.ipc;
        const sendMessageOnClick =
            (messageName: string) => (_, window: BrowserWindow) => ipc.sendMessage(window, { name: messageName });

        /**
         * Long-Time-Leave TODO
         * : Make menu perfect.
         */

        // Standard menus for macOS
        if (__DARWIN__) {
            template.push({
                label: 'Geeks Diary',
                submenu: [
                    {
                        label: 'About Geeks Diary',
                        id: 'about',
                        click: sendMessageOnClick('showAbout'),
                    },
                    separator,
                    {
                        label: 'Preferences…',
                        id: 'preferences',
                        accelerator: 'CmdOrCtrl+,',
                        click: sendMessageOnClick('showPreferences'),
                    },
                    separator,
                    {
                        role: 'services',
                        submenu: [],
                    },
                    separator,
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    separator,
                    { role: 'quit' },
                ],
            });
        }

        // File menu
        const fileMenu: MenuItemConstructorOptions = {
            label: __DARWIN__ ? 'File' : '&File',
            submenu: [
                {
                    label: __DARWIN__ ? 'New Note' : 'New &note',
                    id: 'new-note',
                    accelerator: 'CmdOrCtrl+N',
                    click: sendMessageOnClick('newNote'),
                },
                separator,
                {
                    label: __DARWIN__ ? 'Save' : '&Save',
                    id: 'save-note',
                    accelerator: 'CmdOrCtrl+S',
                    click: sendMessageOnClick('saveNote'),
                },
            ],
        };

        if (__DARWIN__) {
            (fileMenu.submenu as MenuItemConstructorOptions[]).push(
                separator,
                { role: 'quit' },
            );
        }

        template.push(fileMenu);

        // Edit
        template.push({
            label: __DARWIN__ ? 'Edit' : '&Edit',
            submenu: [
                { role: 'undo', label: __DARWIN__ ? 'Undo' : '&Undo' },
                { role: 'redo', label: __DARWIN__ ? 'Redo' : '&Redo' },
                separator,
                { role: 'cut', label: __DARWIN__ ? 'Cut' : 'Cu&t' },
                { role: 'copy', label: __DARWIN__ ? 'Copy' : '&Copy' },
                { role: 'paste', label: __DARWIN__ ? 'Paste' : '&Paste' },
                {
                    role: 'selectAll',
                    label: __DARWIN__ ? 'Select All' : 'Select &all',
                },
            ],
        });

        // View
        const viewMenu: MenuItemConstructorOptions = {
            label: __DARWIN__ ? 'View' : '&View',
            submenu: [
                {
                    label: __DARWIN__ ? 'Toggle Note List' : 'Toggle &note list',
                    id: 'toggle-note-list',
                    accelerator: 'CmdOrCtrl+1',
                    click: sendMessageOnClick('toggleNoteList'),
                },
                {
                    label: __DARWIN__ ? 'Toggle Vcs' : 'Toggle &vcs',
                    id: 'toggle-vcs',
                    accelerator: 'CmdOrCtrl+2',
                    click: sendMessageOnClick('toggleVcs'),
                },
                separator,
                {
                    id: 'note-view',
                    label: 'Note View',
                    submenu: [
                        {
                            label: 'Editor Only',
                            id: 'note-view-editor-only',
                            type: 'checkbox',
                            click: sendMessageOnClick('changeEditorViewModeToEditorOnly'),
                        },
                        {
                            label: 'Preview Only',
                            id: 'note-view-preview-only',
                            type: 'checkbox',
                            click: sendMessageOnClick('changeEditorViewModeToPreviewOnly'),
                        },
                        {
                            label: 'Show Both',
                            id: 'note-view-show-both',
                            type: 'checkbox',
                            click: sendMessageOnClick('changeEditorViewModeToShowBoth'),
                        },
                    ],
                },
            ],
        };

        if (!environment.production) {
            (viewMenu.submenu as MenuItemConstructorOptions[]).push(
                separator,
                { role: 'reload' },
            );
        }

        template.push(viewMenu);

        // Repository
        template.push({
            label: __DARWIN__ ? 'Repository' : '&Repository',
            submenu: [
                {
                    label: 'Commit Note',
                    id: 'commit-note',
                    accelerator: 'CmdOrCtrl+K',
                    click: sendMessageOnClick('commitNote'),
                },
                {
                    label: 'Sync Repository',
                    id: 'sync-repository',
                    accelerator: 'CmdOrCtrl+Shift+K',
                    click: sendMessageOnClick('syncRepository'),
                },
            ],
        });

        // Snippet
        template.push({
            label: __DARWIN__ ? 'Snippet' : '&Snippet',
            submenu: [
                {
                    label: __DARWIN__ ? 'New Text Snippet' : 'New &text snippet',
                    id: 'new-text-snippet',
                    accelerator: 'CmdOrCtrl+Shift+T',
                    click: sendMessageOnClick('newTextSnippet'),
                },
                {
                    label: __DARWIN__ ? 'New Code Snippet' : 'New &code snippet',
                    id: 'new-code-snippet',
                    accelerator: 'CmdOrCtrl+Shift+C',
                    click: sendMessageOnClick('newCodeSnippet'),
                },
                separator,
                {
                    label: __DARWIN__ ? 'Insert Image' : 'Insert &image',
                    id: 'insert-image',
                    accelerator: 'Ctrl+Shift+I',
                    click: sendMessageOnClick('insertImage'),
                },
            ],
        });

        // Window
        if (__DARWIN__) {
            template.push({
                role: 'window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { role: 'close' },
                    separator,
                    { role: 'front' },
                ],
            });
        }

        return template;
    }
}
