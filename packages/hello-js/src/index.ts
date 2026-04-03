import type { HelloJSNode } from './template';
export { h } from './template';

export type Dispose = () => void;

export type Component = () => () => HelloJSNode;

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
