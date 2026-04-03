import type { Signal } from './signal';

export type Dispose = () => void;

export const NODE_IDENTIFIER: unique symbol = Symbol();

export type Props<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> = Partial<HTMLElementTagNameMap[T]> & {
  ref?: (element: HTMLElementTagNameMap[T]) => void;
};

export interface HJElementNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof NODE_IDENTIFIER;
  tagName: T;
  properties: Props<T>;
  children: readonly HJNode[];
}

export type UHJElementNode = {
  [T in keyof HTMLElementTagNameMap]: HJElementNode<T>;
}[keyof HTMLElementTagNameMap];

export type HJNode =
  | null
  | string
  | UHJElementNode
  | (() => null | string | UHJElementNode);

export type HJChild =
  | null
  | false
  | string
  | UHJElementNode
  | (() => null | false | string | UHJElementNode);

export type HJNodeSignal = Signal<HJNode>;

export type Component = () => () => HJNode;
