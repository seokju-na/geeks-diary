// import { Injectable, OnDestroy, QueryList } from '@angular/core';
// import { select, Store } from '@ngrx/store';
// import { Observable, Subscription } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { NoteSnippetTypes } from '../../../models/note-snippet';
// import { NoteSnippetEditor } from '../note-snippet-editors/note-snippet-editor';
// import { NoteSnippetEditorConfig } from '../note-snippet-editors/note-snippet-editor-config';
// import {
//     NoteSnippetEditorEvent,
//     NoteSnippetEditorEventNames,
// } from '../note-snippet-editors/note-snippet-editor-events';
// import { NoteSnippetContent } from './note-content.model';
// import {
//     InsertSnippetAction,
//     LoadNoteContentAction,
//     RemoveNoteContentAction,
//     RemoveSnippetAction,
//     SetActiveSnippetIndexAction,
//     UpdateSnippetAction,
// } from './note-editor.actions';
// import { NoteItem } from './note-item.model';
// import { NoteStateWithRoot } from './note.state';
//
//
// export interface NoteSnippetEditorOutlet {
//     content: NoteSnippetContent;
//     config: NoteSnippetEditorConfig;
// }
//
//
// // TODO : Handling note editor configuration
// @Injectable()
// export class NoteEditorService implements OnDestroy {
//     private queryList: QueryList<NoteSnippetEditor> | null = null;
//     private queryListChangeSubscription = Subscription.EMPTY;
//     private eventsSubscriptionMap = new Map<NoteSnippetEditor, Subscription>();
//
//     private snippetEditorArrayCache: NoteSnippetEditor[] | null = null;
//
//     constructor(private store: Store<NoteStateWithRoot>) {
//     }
//
//     ngOnDestroy(): void {
//         this.queryListChangeSubscription.unsubscribe();
//         this.unsubscribeAllSnippetEditorEvents(this.snippetEditorArrayCache);
//
//         if (this.snippetEditorArrayCache) {
//             this.snippetEditorArrayCache = null;
//         }
//     }
//
//     loadNoteContent(note: NoteItem): void {
//         this.store.dispatch(new LoadNoteContentAction({ note }));
//     }
//
//     dispose(): void {
//         this.unsubscribeAllSnippetEditorEvents(this.snippetEditorArrayCache);
//         this.snippetEditorArrayCache = [];
//         this.store.dispatch(new RemoveNoteContentAction());
//     }
//
//     getOutlets(): Observable<NoteSnippetEditorOutlet[]> {
//         return this.store.pipe(
//             select(state => state.note.editor),
//             map(editorState =>
//                 editorState.loaded
//                     ? editorState.selectedNoteContent.snippets.map(snippetContent => ({
//                         content: snippetContent,
//                         config: new NoteSnippetEditorConfig(),
//                     }))
//                     : [],
//             ),
//         );
//     }
//
//     // TODO : Implement this method
//     onFocusOutToTop(): Observable<void> {
//         return null;
//     }
//
//     initSnippetEditors(snippetEditors: QueryList<NoteSnippetEditor>): void {
//         this.queryList = snippetEditors;
//         this.queryListChangeSubscription =
//             this.queryList.changes.subscribe(() => {
//                 this.updateSnippetEditorArrayCache();
//
//                 this.unsubscribeAllSnippetEditorEvents(this.snippetEditorArrayCache);
//                 this.subscribeAllSnippetEditorEvents(this.snippetEditorArrayCache);
//             });
//     }
//
//     insertSnippetEditor(
//         index: number,
//         snippet: NoteSnippetContent,
//     ): void {
//         this.store.dispatch(new InsertSnippetAction({
//             index,
//             snippet,
//         }));
//
//         // Wait for query list changes.
//         // When component are ready, focus new snippet editor.
//         this.queryList.changes.pipe(take(1)).subscribe(() => {
//             this.focusTo(index + 1);
//         });
//     }
//
//     removeSnippetEditor(index: number): void {
//         if (index === 0) {
//             return;
//         }
//
//         this.store.dispatch(new RemoveSnippetAction({ index }));
//
//         // Since current snippet editor is remove, we should move focus to
//         // previous snippet editor.
//         this.moveFocusByDirection(index, -1);
//     }
//
//     moveFocusByDirection(index: number, dir: 1 | -1): void {
//         const nextIndex = index + dir;
//         const setPosition = dir === 1 ? 'top' : 'bottom';
//
//         // Ignore out of range.
//         if (nextIndex < 0 || nextIndex > this.snippetEditorArrayCache.length - 1) {
//             return;
//         }
//
//         this.focusTo(nextIndex, setPosition);
//     }
//
//     focusTo(index: number, setPosition?: 'top' | 'bottom'): void {
//         const item = this.snippetEditorArrayCache[index];
//
//         if (!item) {
//             return;
//         }
//
//         item.focus();
//
//         if (setPosition) {
//             if (setPosition === 'top') {
//                 item.setPositionToTop();
//             } else if (setPosition === 'bottom') {
//                 item.setPositionToBottom();
//             }
//         }
//     }
//
//     updateSnippetEditorContent(
//         index: number,
//         patch: Partial<NoteSnippetContent>,
//     ): void {
//
//         this.store.dispatch(new UpdateSnippetAction({ index, patch }));
//     }
//
//     private handleSnippetEditorEvents(event: NoteSnippetEditorEvent): void {
//         const index = this.snippetEditorArrayCache.findIndex(
//             snippetEditor => snippetEditor === event.source,
//         );
//
//         if (index === -1) {
//             return;
//         }
//
//         switch (event.name) {
//             case NoteSnippetEditorEventNames.INSERT_NEW_SNIPPET_AFTER_THIS:
//                 this.insertSnippetEditor(
//                     index,
//                     this.createNewSnippetContentSimilarWithPreviousSnippetContent(
//                         event.source.content,
//                     ),
//                 );
//                 break;
//
//             case NoteSnippetEditorEventNames.VALUE_CHANGED:
//                 this.updateSnippetEditorContent(
//                     index,
//                     {
//                         ...event.source.content,
//                         value: event.source.getRawValue(),
//                     },
//                 );
//                 break;
//
//             case NoteSnippetEditorEventNames.REMOVE_THIS:
//                 this.removeSnippetEditor(index);
//                 break;
//
//             case NoteSnippetEditorEventNames.FOCUSED:
//                 this.store.dispatch(new SetActiveSnippetIndexAction({
//                     activeIndex: index,
//                 }));
//                 break;
//
//             case NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS:
//                 this.moveFocusByDirection(index, -1);
//                 break;
//
//             case NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT:
//                 this.moveFocusByDirection(index, 1);
//                 break;
//         }
//     }
//
//     private subscribeAllSnippetEditorEvents(
//         snippetEditors: NoteSnippetEditor[],
//     ): void {
//         snippetEditors.forEach(snippetEditor =>
//             this.subscribeSnippetEditorEvents(snippetEditor),
//         );
//     }
//
//     private subscribeSnippetEditorEvents(
//         snippetEditor: NoteSnippetEditor,
//     ): void {
//         if (this.eventsSubscriptionMap.has(snippetEditor)) {
//             this.unsubscribeSnippetEditorEvents(snippetEditor);
//         }
//
//         this.eventsSubscriptionMap.set(
//             snippetEditor,
//             snippetEditor.events.subscribe(
//                 event => this.handleSnippetEditorEvents(event),
//             ),
//         );
//     }
//
//     private unsubscribeAllSnippetEditorEvents(
//         snippetEditors: NoteSnippetEditor[],
//     ): void {
//         snippetEditors.forEach(snippetEditor =>
//             this.unsubscribeSnippetEditorEvents(snippetEditor),
//         );
//     }
//
//     private unsubscribeSnippetEditorEvents(
//         snippetEditor: NoteSnippetEditor,
//     ): void {
//         if (this.eventsSubscriptionMap.has(snippetEditor)) {
//             const subscription =
//                 this.eventsSubscriptionMap.get(snippetEditor);
//
//             if (subscription) {
//                 subscription.unsubscribe();
//             }
//
//             this.eventsSubscriptionMap.delete(snippetEditor);
//         }
//     }
//
//     private updateSnippetEditorArrayCache(): void {
//         if (this.queryList) {
//             this.snippetEditorArrayCache = this.queryList.toArray();
//         }
//     }
//
//     private createNewSnippetContentSimilarWithPreviousSnippetContent(
//         snippet: NoteSnippetContent,
//     ): NoteSnippetContent {
//
//         switch (snippet.type) {
//             case NoteSnippetTypes.TEXT:
//                 return {
//                     type: snippet.type,
//                     value: '',
//                 };
//
//             case NoteSnippetTypes.CODE:
//                 return {
//                     type: snippet.type,
//                     value: '',
//                     codeLanguageId: snippet.codeLanguageId,
//                     codeFileName: '',
//                 };
//         }
//     }
// }
