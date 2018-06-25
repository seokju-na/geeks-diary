import * as nodeGit from 'nodegit';


/**
 * Use case for renderer:
 *
 * import { remote } from 'electron';
 *
 * const nodegit: any = remote.getGlobal('nodegit');
 */
(<any>global).nodegit = nodeGit;
