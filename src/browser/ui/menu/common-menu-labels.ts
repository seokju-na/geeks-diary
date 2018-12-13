import { __DARWIN__, __WIN32__ } from '../../../libs/platform';


export const commonMenuLabels = {
    revealInFileManager: __DARWIN__
        ? 'Reveal in Finder'
        : __WIN32__
            ? 'Show in Explorer'
            : 'Show in your File Manager',
    trashName: __DARWIN__ ? 'Trash' : 'Recycle Bin',
};
