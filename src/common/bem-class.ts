export class BemModifier {
    readonly name: string;
    protected modifiers: {[key: string]: string} = {};

    constructor(name: string) {
        this.name = name;
    }

    setModifier(flag: string, value: string): this {
        this.modifiers[flag] = value;

        return this;
    }
}


export class BemBlock extends BemModifier {
    constructor(blockName: string) {
        super(blockName);
    }

    element(name: string): BemElement {
        return new BemElement(this, name);
    }

    toString(): string {
        const modifierClassNames = Object.keys(this.modifiers).map(flag =>
            `${this.name}--${flag}-${this.modifiers[flag]}`);

        return [this.name].concat(modifierClassNames).join(' ');
    }
}


export class BemElement extends BemModifier {
    constructor(private parentBlock: BemBlock, elementName: string) {
        super(elementName);
    }

    toString(): string {
        const blockElemName = `${this.parentBlock.name}__${this.name}`;
        const modifierClassNames = Object.keys(this.modifiers).map(flag =>
            `${this.name}--${flag}-${this.modifiers[flag]}`);

        return [blockElemName].concat(modifierClassNames).join(' ');
    }
}
