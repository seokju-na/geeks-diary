interface Modifier {
    flag: string;
    value: string;
}

class ModifierFactory {
    modifiers: Modifier[] = [];

    hasModifier(flag: string): boolean {
        const index = this.modifiers.findIndex(m =>
            m.flag === flag);

        return index !== -1;
    }

    getModifier(flag: string): (Modifier | null) {
        if (this.hasModifier(flag)) {
            return this.modifiers.find(m => m.flag === flag);
        }

        return null;
    }

    setModifier(flag: string, value: string) {
        if (this.hasModifier(flag)) {
            const modifier = this.getModifier(flag);
            modifier.value = value;
        } else {
            this.modifiers.push({ flag, value });
        }
    }
}

class ClassNameFactory extends ModifierFactory {
    name: string;

    constructor(name) {
        super();
        this.name = name;
    }

    get(): string {
        const classNames = [this.name];

        this.modifiers.forEach((modifier) => {
            const flag = modifier.flag;
            const value = modifier.value;

            const className = `${this.name}--${flag}-${value}`;

            classNames.push(className);
        });

        return classNames.join(' ');
    }
}

export class ClassName extends ClassNameFactory {
    public elements = [];

    private _parseElementName(elementName: string): string {
        return `${this.name}__${elementName}`;
    }

    constructor(name) {
        super(name);
    }

    hasElement(elementName: string): boolean {
        const index = this.elements.findIndex(e =>
            e.name === this._parseElementName(elementName));

        return index !== -1;
    }

    getElement(elementName: string): (string | null) {
        if (this.hasElement(elementName)) {
            return this.elements.find(e =>
                e.name === this._parseElementName(elementName));
        }

        return null;
    }

    addElement(elementName: string) {
        if (this.hasElement(elementName)) {
            return;
        }

        const name = this._parseElementName(elementName);
        this.elements.push(new ClassNameFactory(name));
    }
}
