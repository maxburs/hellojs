import type { Dispose } from './types';

export type Invalidate = () => void;

let parentInvalidate: undefined | Invalidate;
let parentChildren: undefined | Dispose[];

function runWithParent<T>(
  invalidate: undefined | Invalidate,
  children: Dispose[],
  cb: () => T,
): T {
  const _parent = parentInvalidate;
  const _parentChildren = parentChildren;
  parentInvalidate = invalidate;
  parentChildren = children;

  const value = cb();

  parentInvalidate = _parent;
  parentChildren = _parentChildren;

  return value;
}

// let context: undefined | Entity;

// class Entity {
//   private _children: Entity[] = [];

//   constructor(
//     private readonly  onInvalidate: undefined | Invalidate,
//     public readonly  dispose: undefined | Dispose,
//   ) {}

//   get children(): readonly Entity[] {
//     return this._children;
//   }
//   addDependent(dependent: Entity) {
//     this._children.push(dependent);
//   }
//   // children: Invalidate[];
// }

function disposeChildren(children: Dispose[]) {
  console.group('clear children');
  for (let i = children.length - 1; i >= 0; i--) {
    children[i]();
  }
  // for (const d of children) {
  //   d();
  // }
  console.groupEnd();
}

export interface Signal<T = unknown> {
  (): T;
}

export interface MutableSignal<T> extends Signal<T> {
  set(value: T): void;
}

export function createSignal<T>(value: T): MutableSignal<T> {
  function signal() {
    if (parentInvalidate) {
      _children.push(parentInvalidate);
    }
    return value;
  }

  let _children: Dispose[] = [];

  signal.set = function set(_value: T) {
    const deps = _children;

    // Update state before invalidating deps
    _children = [];
    value = _value;

    disposeChildren(deps);
  };

  // const entity: Entity = {
  //   invalidate: undefined,
  //   dispose: undefined,
  //   children:
  // }

  // signal._children = _children;

  return signal as MutableSignal<T>;
}

export type Computed<T> = () => T;

export function createComputed<T>(cb: () => T): Computed<T> {
  if (!parentChildren) {
    throw new Error(`createComputed must be called in a reactive context`);
  }

  let disposed = false;

  parentChildren.push(computed__dispose);

  function computed__dispose() {
    console.group('computed__dispose');
    disposed = true;
    if (state) {
      disposeChildren(state.children);
    }
    console.groupEnd();
  }

  let state: undefined | { children: Dispose[]; readers: Invalidate[], value: T };

  function computed__invalidate() {
    if (disposed) {
      throw new Error(`Computed is disposed`);
    }
    console.group('computed__invalidate', state);
    if (!state) {
      console.groupEnd();
      return;
    }
    const prevState = state;
    state = undefined;
    disposeChildren(prevState.children);
    disposeChildren(prevState.readers);
    console.groupEnd();
  }

  function computed(): T {
    console.group('read computed', state);
    if (!state) {
      const children: Dispose[] = [];

      const value = runWithParent(computed__invalidate, children, cb);

      // const _parent = parentInvalidate;
      // const _parentChildren = parentChildren;
      // parentInvalidate = computed__invalidate;
      // parentChildren = children;

      // const _value = cb();

      // console.log('computed -- children', children);

      // parentInvalidate = _parent;
      // parentChildren = _parentChildren;

      state = { children, readers: [], value };
    }

    if (parentInvalidate) {
      state.readers.push(parentInvalidate);
    }

    console.groupEnd();

    return state.value;
  }

  return computed;
}

export function createEffect(cb: () => void): void {
  if (!parentChildren) {
    throw new Error(`effect must be called in a reactive context`);
  }
  parentChildren.push(effect__dispose);

  let disposed = false;
  let children: Dispose[] = [];

  function effect__dispose() {
    console.group('effect__dispose')
    disposed = true;
    effect__clear();
    console.groupEnd();
  }

  function effect__clear() {
    const deps = children;
    children = [];
    disposeChildren(deps);
  }

  function effect__invalidate() {
    if (disposed) {
      return;
    }
    console.group('effect__invalidate');
    effect__clear();
    effect__evaluate();
    console.groupEnd();
  }

  function effect__evaluate() {
    console.group('effect__evaluate');

    runWithParent(effect__invalidate, children, cb);

    // const _parent = parentInvalidate;
    // const _parentChildren = parentChildren;
    // parentInvalidate = effect__invalidate;
    // parentChildren = children;

    // cb();

    // parentInvalidate = _parent;
    // parentChildren = _parentChildren;
    console.groupEnd();
  }

  effect__evaluate();
}

export function cleanup(cb: () => void): void {
  if (!parentChildren) {
    throw new Error(`cleanup must be called in a reactive context`);
  }
  parentChildren.push(cb);
}

export function createRoot(
  cb: () => void,
  options?: { signal?: AbortSignal },
): Dispose {
  const children: Dispose[] = [];

  function root__dispose() {
    console.group('root_dispose', children);
    for (const d of children) {
      d();
    }
    console.groupEnd();
  }

  if (options?.signal?.aborted) {
    return root__dispose;
  }

  options?.signal?.addEventListener('abort', root__dispose);

  runWithParent(undefined, children, cb);

  // const _reader = parentInvalidate;
  // const _parent = parentChildren;
  // parentInvalidate = undefined;
  // parentChildren = children;

  // cb();

  // parentInvalidate = _reader;
  // parentChildren = _parent;

  return root__dispose;
}
