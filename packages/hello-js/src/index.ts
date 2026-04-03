export type Dispose = () => void;

const nodeIdentifier: unique symbol = Symbol();

export interface HelloJSNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof nodeIdentifier;
  tagName: T;
  properties: Partial<HTMLElementTagNameMap[T]>;
  children: readonly HelloJSNode[];
}

export type HelloJSChild = null | false | string | HelloJSNode;

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: HelloJSChild | Partial<HTMLElementTagNameMap[T]>,
  ...children: HelloJSChild[]
): HelloJSNode<T> {
  let properties: undefined | Partial<HTMLElementTagNameMap[T]>;
  const nodes: HelloJSNode[] = [];
  let text = '';

  switch (typeof props) {
    case 'object':
      if (props && '$$node' in props && props.$$node === nodeIdentifier) {
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
        text += child;
        break;
      case 'object':
        if (child !== null) {
          nodes.push(child);
        }
    }
  }

  if (text) {
    properties = { innerText: '', ...properties } as Partial<
      HTMLElementTagNameMap[T]
    >;
    properties.innerText += text;
  } else {
    properties ??= {};
  }

  return { $$node: nodeIdentifier, tagName, properties, children: nodes };
}

export function render(node: HelloJSNode, target: HTMLElement): Dispose {
  const element = document.createElement(node.tagName);
  Object.assign(element, node.properties);
  for (const child of node.children) {
    render(child, element);
  }

  target.appendChild(element);

  return () => {
    target.removeChild(element);
  };
}
