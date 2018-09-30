export const PROP_METADATA = '__prop__metadata__';


function makeMetadataCtor(props?: (...args: any[]) => any): any {
    return function ctor(...args: any[]) {
        if (props) {
            const values = props(...args);

            /* tslint:disable */
            for (const propName in values) {
                // noinspection JSUnfilteredForInLoop
                this[propName] = values[propName];
            }
            /* tslint:enable */
        }
    };
}


export function makePropDecorator(
    _name: string,
    props?: (...args: any[]) => any,
): any {

    const metaCtor = makeMetadataCtor(props);

    function PropDecoratorFactory(...args: any[]): any {
        if (this instanceof PropDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }

        const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

        return function PropDecorator(target: any, name: string) {
            const constructor = target.constructor;

            // Use of Object.defineProperty is important since it creates non-enumerable property which
            // prevents the property is copied during subclassing.
            const meta = constructor.hasOwnProperty(PROP_METADATA)
                ? (constructor as any)[PROP_METADATA]
                : Object.defineProperty(constructor, PROP_METADATA, { value: {} })[PROP_METADATA];

            meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
            meta[name].unshift(decoratorInstance);
        };
    }

    PropDecoratorFactory.prototype.metadataName = _name;

    return PropDecoratorFactory;
}
