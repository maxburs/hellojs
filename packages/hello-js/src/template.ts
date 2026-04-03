const NODE_IDENTIFIER: unique symbol = Symbol();

export interface HJElementNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof NODE_IDENTIFIER;
  tagName: T;
  properties: Partial<HTMLElementTagNameMap[T]>;
  children: readonly HJNode[];
}

export interface HJTextNode {
  $$node: typeof NODE_IDENTIFIER;
  tagName: 'text';
  text: string;
}

export type HJNode = HJElementNode | HJTextNode;

export type HJChild = null | false | string | HJNode;

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: HJChild | Partial<HTMLElementTagNameMap[T]>,
  ...children: HJChild[]
): HJElementNode<T> {
  let properties: undefined | Partial<HTMLElementTagNameMap[T]>;
  const nodes: HJNode[] = [];

  switch (typeof props) {
    case 'object':
      if (props && '$$node' in props && props.$$node === NODE_IDENTIFIER) {
        children.unshift(props);
      } else {
        properties = props as Partial<HTMLElementTagNameMap[T]>;
      }
      break;
    case 'boolean':
    case 'string':
      children.unshift(props);
      break;
    default:
      throw new Error(`Invalid argument type ${typeof props}`);
  }

  for (const child of children) {
    switch (typeof child) {
      case 'string':
        nodes.push({ $$node: NODE_IDENTIFIER, tagName: 'text', text: child });
        break;
      case 'object':
        if (child !== null) {
          nodes.push(child);
        }
    }
  }
  
  properties ??= {};

  return { $$node: NODE_IDENTIFIER, tagName, properties, children: nodes };
}
