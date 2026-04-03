import { createComputed, type Computed } from './signal';

const NODE_IDENTIFIER: unique symbol = Symbol();

export interface HJElementNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof NODE_IDENTIFIER;
  tagName: T;
  properties: Partial<HTMLElementTagNameMap[T]>;
  children: readonly Computed<null | HJNode>[];
}

export interface HJTextNode {
  $$node: typeof NODE_IDENTIFIER;
  tagName: 'text';
  text: string;
}

export type HJNode = HJElementNode | HJTextNode;

export type HJChild =
  | null
  | false
  | string
  | HJElementNode
  | (() => null | false | string | HJElementNode);

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: HJChild | Partial<HTMLElementTagNameMap[T]>,
  ...children: HJChild[]
): HJElementNode<T> {
  let properties: undefined | Partial<HTMLElementTagNameMap[T]>;
  const nodes: Computed<null | HJNode>[] = [];

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
    nodes.push(
      () => {
        let c = child;
        if (typeof c === 'function') {
          c = c();
        }
        switch (typeof c) {
          case 'string':
            return { $$node: NODE_IDENTIFIER, tagName: 'text', text: c };
          case 'object':
            return c;
          default:
            return null;
        }
      },
    );
  }

  properties ??= {};

  return { $$node: NODE_IDENTIFIER, tagName, properties, children: nodes };
}
