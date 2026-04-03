import { type HJElementNode, type HJChild, type HJNode, NODE_IDENTIFIER } from './types';

function childToNode(
  child: null | false | string | HJElementNode,
): null | string | HJElementNode {
  switch (typeof child) {
    case 'object':
    case 'string':
      return child;
    default:
      return null;
  }
}

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: HJChild | Partial<HTMLElementTagNameMap[T]>,
  ...children: HJChild[]
): HJElementNode<T> {
  let properties: undefined | Partial<HTMLElementTagNameMap[T]>;
  const nodes: HJNode[] = [];

  switch (typeof props) {
    case 'function':
      children.unshift(props);
      break;
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
    case 'undefined':
      break;
    default:
      throw new Error(`Invalid argument type ${typeof props}`);
  }

  for (const child of children) {
    if (typeof child === 'function') {
      nodes.push(() => childToNode(child()));
    } else {
      nodes.push(() => childToNode(child));
    }
  }

  properties ??= {};

  return { $$node: NODE_IDENTIFIER, tagName, properties, children: nodes };
}
