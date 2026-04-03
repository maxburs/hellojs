import type { HJElementNode } from './template';
export * from './template';
export * from './render';

export type Dispose = () => void;

export type Component = () => () => HJElementNode;
