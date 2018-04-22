import { DummyFactory, StringIdDummyFactory } from '../../testing/dummy';
import { Stack, StackIcon, StackLanguage } from './models';


export class StackLanguageDummyFactory implements DummyFactory<StackLanguage> {
    id: StringIdDummyFactory;

    constructor(namespace = 'language') {
        this.id = new StringIdDummyFactory(namespace);
    }

    create(): StackLanguage {
        return {
            id: this.id.create(),
        };
    }
}


export class StackDummyFactory implements DummyFactory<Stack> {
    name: StringIdDummyFactory;

    constructor(namespace = 'stack') {
        this.name = new StringIdDummyFactory(namespace);
    }

    create(
        hasIcon = false,
        hasLanguage = false,
        hasColor = false,
    ): Stack {

        const name = this.name.create();
        let icon: StackIcon;
        let language: StackLanguage;
        let color: string;

        if (hasIcon) {
            icon = { tags: [], versions: ['original'] };
        }

        if (hasLanguage) {
            language = { id: name };
        }

        if (hasColor) {
            color = '#DC143C'; // CRIMSON
        }

        return new Stack(name, icon, language, color);
    }
}
