import { Dummy, sample, StringIdDummy } from '../../../test/helpers';
import { languageAndIconAndColorMap } from './languages';
import { Stack } from './stack.model';


export class StackDummy extends Dummy<Stack> {
    private name = new StringIdDummy('stackName');

    create(isLanguage = false, hasIcon = false): Stack {
        const map = sample(languageAndIconAndColorMap);
        const name = isLanguage ? map.id : this.name.create();

        return {
            name,
            icon: hasIcon
                ? { iconName: name, tags: [], versions: [] }
                : null,
            iconFilePath: hasIcon ? 'http://via.placeholder.com/64' : null,
            languageId: isLanguage ? map.id : null,
            color: map.color ? map.color : null,
        };
    }
}
