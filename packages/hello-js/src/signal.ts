import type { Dispose } from './types';

export type Invalidate = () => void;

let lastName = 0;
let logging = true;

function createName() {
  return lastName++;
}

function group(...args: unknown[]) {
  if (logging) {
    console.group(...args);
  }
}

function groupEnd() {
  if (logging) {
    console.groupEnd();
  }
}

let parent: undefined | Parent;

interface Parent {
  invalidate: undefined | Invalidate;
  onDispose: AbortSignal;
}

function runWithParent<T, Args extends unknown[]>(
  _parent: Parent,
  cb: (...args: Args) => T,
  ...args: Args
): T {
  const prev = parent;
  parent = _parent;

  const value = cb(...args);

  parent = prev;

  return value;
}

function invalidateReaders(readers: Invalidate[]) {
  group('invalidateReaders', readers);
  for (const invalidate of readers) {
    invalidate();
  }
  groupEnd();
}

export interface Signal<T = unknown> {
  (): T;
}

export interface MutableSignal<T> extends Signal<T> {
  set(value: T): void;
}

export function createSignal<T>(value: T): MutableSignal<T> {
  let readers: Invalidate[] = [];

  function signal() {
    console.log('signal read')
    const _parent = parent;
    if (_parent?.invalidate) {
      readers.push(_parent.invalidate);
      _parent.onDispose.addEventListener('abort', () => {
        readers = readers.filter((r) => r !== _parent.invalidate);
        console.log('signal readers updated:', readers);
      });
      console.log('reader added', readers);
    }
    return value;
  }

  signal.set = function set(_value: T) {
    const prevReaders = readers;

    readers = [];
    value = _value;

    invalidateReaders(prevReaders);
  };

  return signal as MutableSignal<T>;
}

export type Computed<T> = () => T;

export function createComputed<T>(
  cb: (options: { signal: AbortSignal }) => T,
  options?: { name: string },
): Computed<T> {
  if (!parent) {
    throw new Error(`createComputed must be called in a reactive context`);
  }

  const name = options?.name ?? createName();

  const disposeSignal = parent.onDispose;

  disposeSignal.addEventListener('abort', computed__dispose);

  function computed__dispose() {
    group(`computed-${name}__dispose`);
    state?.controller.abort();
    groupEnd();
  }

  let state:
    | undefined
    | {
        controller: AbortController;
        parent: Parent;
        readers: Invalidate[];
        value: T;
      };

  function computed__invalidate() {
    if (disposeSignal.aborted) {
      throw new Error(`runtime bug: computed is disposed`);
    }
    group(`computed-${name}__invalidate`, state);
    if (!state) {
      groupEnd();
      return;
    }
    const prevState = state;
    state = undefined;

    invalidateReaders(prevState.readers);
    groupEnd();
  }

  function computed(): T {
    if (disposeSignal) {
      throw new Error(`computed-${name} is disposed`);
    }
    group(`computed-${name} read`, state);
    if (!state) {
      const controller = new AbortController();
      const signal = controller.signal;

      const parent: Parent = {
        invalidate: computed__invalidate,
        onDispose: signal,
      };

      const value = runWithParent(parent, cb, { signal });

      state = { controller, parent, readers: [], value };
    }

    const _parent = parent;
    if (_parent?.invalidate) {
      const _state = state;
      _state.readers.push(_parent.invalidate);
      _parent.onDispose.addEventListener('abort', () => {
        if (_state === state) {
          _state.readers = _state.readers.filter(
            (r) => r !== _parent.invalidate,
          );
        }
      });
    }

    groupEnd();

    return state.value;
  }

  return computed;
}

export function createEffect(
  cb: (options: { signal: AbortSignal }) => void,
  options?: { name?: number | string },
): void {
  if (!parent) {
    throw new Error(`effect must be called in a reactive context`);
  }

  const name = options?.name ?? createName();
  const disposedSignal = parent.onDispose;
  disposedSignal.addEventListener('abort', effect__dispose);

  function createState() {
    const controller = new AbortController();

    return {
      invalidate: effect__invalidate,
      controller,
      onDispose: _controller.signal,
    };
  }

  const _controller = new AbortController();

  let state = createState();

  function effect__dispose() {
    group(`effect-${name}__dispose`);
    effect__clear();
    groupEnd();
  }

  function effect__clear() {
    const prev = state;
    state = createState();
    console.log('aborting effect signal')
    prev.controller.abort();
  }

  function effect__invalidate() {
    if (disposedSignal.aborted) {
      throw new Error(`runtime bug: effect is disposed`);
    }
    group(`effect-${name}__invalidate`);
    effect__clear();
    effect__evaluate();
    groupEnd();
  }

  function effect__evaluate() {
    group(`effect-${name}__evaluate`);

    runWithParent(state, cb, { signal: state.onDispose });

    groupEnd();
  }

  effect__evaluate();
}

export function cleanup(cb: () => void): void {
  if (!parent) {
    throw new Error(`cleanup must be called in a reactive context`);
  }
  parent.onDispose.addEventListener('abort', cb);
}

export function createRoot(
  cb: () => void,
  options?: { signal?: AbortSignal },
): Dispose {
  const controller = new AbortController();

  function root__dispose() {
    group('root_dispose', controller.signal);
    controller.abort();
    groupEnd();
  }

  if (options?.signal?.aborted) {
    return root__dispose;
  }

  options?.signal?.addEventListener('abort', root__dispose);

  runWithParent({ onDispose: controller.signal, invalidate: undefined }, cb);

  return root__dispose;
}
