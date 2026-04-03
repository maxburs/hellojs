import type { Dispose } from '.';

export type Invalidate = () => void;

type Dependents = Invalidate[];

let reader: undefined | Invalidate;
let parent: undefined | Invalidate[];

function clearDependents(dependents: Dependents) {
  console.group('clear dependents');
  for (let i = dependents.length - 1; i >= 0; i--) {
    dependents[i]();
  }
  // for (const d of dependents) {
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
    if (reader) {
      _dependents.push(reader);
    }
    return value;
  }

  let _dependents: Dependents = [];

  signal.set = function set(_value: T) {
    const deps = _dependents;

    // Update state before invalidating deps
    _dependents = [];
    value = _value;

    clearDependents(deps);
  };

  signal._dependents = _dependents;

  return signal as MutableSignal<T>;
}

export function createComputed<T>(cb: () => T): () => T {
  if (!parent) {
    throw new Error(`createComputed must be called in a reactive context`);
  }

  parent.push(computed__invalidate);

  let value: undefined | { dependents: Signal[]; value: T };

  function computed__invalidate() {
    console.group('computed -- invalidate', value);
    if (!value) {
      console.groupEnd();
      return;
    }
    const deps = value.dependents;
    value = undefined;
    clearDependents(deps);
    console.groupEnd();
  }

  function computed(): T {
    console.group('read computed', value);
    if (!value) {
      const dependents: Invalidate[] = [];

      const _reader = reader;
      const _parent = parent;
      reader = computed__invalidate;
      parent = dependents

      const _value = cb();

      console.log('computed -- dependents', dependents);

      reader = _reader;
      parent = _parent;

      value = { dependents, value: _value };
    }

    if (reader) {
      value.dependents.push(reader);
    }

    console.groupEnd();

    return value.value;
  }

  return computed;
}

export function createEffect(cb: () => void) {
  if (!parent) {
    throw new Error(`effect must be called in a reactive context`);
  }

  parent.push(effect__clear);

  let dependents: Dependents = [];

  function effect__clear() {
    console.group('effect__clear');
    const deps = dependents;
    dependents = [];
    clearDependents(deps);
    console.groupEnd();
  }

  function effect__invalidate() {
    effect__clear();
    effect__evaluate();
  }

  function effect__evaluate() {
    console.group('effect__evaluate');
    const _reader = reader;
    const _parent = parent;
    reader = effect__invalidate;
    parent = dependents;

    cb();

    reader = _reader;
    parent = _parent;
    console.groupEnd();
  }

  effect__evaluate();
}

export function cleanup(cb: () => void) {
  if (!parent) {
    throw new Error(`cleanup must be called in a reactive context`);
  }
  parent.push(cb);
}

export function createRoot(
  cb: () => void,
  options?: { signal?: AbortSignal },
): Dispose {
  const dependents: Invalidate[] = [];

  function root__dispose() {
    console.group('root_dispose', dependents);
    for (const d of dependents) {
      d();
    }
    console.groupEnd();
  }

  if (options?.signal?.aborted) {
    return root__dispose;
  }

  options?.signal?.addEventListener('abort', root__dispose);

  const _reader = reader;
  const _parent = parent;
  reader = undefined;
  parent = dependents;

  cb();

  reader = _reader;
  parent = _parent;

  return root__dispose;
}
