export type Dispose = () => void;

const nodeIdentifier: unique symbol = Symbol();

export interface HelloJSNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof nodeIdentifier;
  tagName: T;
  properties: HTMLElementDeprecatedTagNameMap[T];
  children: readonly Node[];
}

export type HelloJSChild = null | false | string | HelloJSNode;

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: HelloJSChild | HTMLElementTagNameMap[T],
  ...children: HelloJSChild[]
): HelloJSNode<T> {
  let properties: HTMLElementDeprecatedTagNameMap[T];
  const nodes: readonly Node[] = [];
  let text = '';

  switch (typeof props) {
    case 'object':
      if ('$$node' in props && props.$$node === nodeIdentifier) {
        children.unshift(props);
      } else {
        properties = props;
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
    if (!properties) {
      properties = { innerText: text };
    } else {
      properties = { innerText: '', ...properties };
      properties.innerText += text;
    }
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
