import { SettingsContext } from '../../settings';
import { VcsSettingsComponent } from './vcs-settings.component';


export const VCS_SETTINGS_ID = 'settings.vcs';

export const vcsSettingsContext: SettingsContext<VcsSettingsComponent> = {
    id: VCS_SETTINGS_ID,
    tabName: 'Version Control',
    component: VcsSettingsComponent,
};
