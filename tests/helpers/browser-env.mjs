import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export function createLocalStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
    dump() {
      return Object.fromEntries(data.entries());
    },
  };
}

export function createStyleRecorder() {
  const values = new Map();
  return {
    setProperty(key, value) {
      values.set(key, value);
    },
    getPropertyValue(key) {
      return values.get(key) || '';
    },
    dump() {
      return Object.fromEntries(values.entries());
    },
  };
}

export function loadBrowserFiles(files, options = {}) {
  const localStorage = options.localStorage || createLocalStorage();
  const openedUrls = [];
  const window = Object.assign({
    localStorage,
    open(url, target) {
      openedUrls.push({ url, target });
    },
  }, options.window || {});

  const context = {
    window,
    localStorage,
    React: options.React,
    console,
    Date: options.Date || Date,
    Math,
    JSON,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout,
    clearTimeout,
  };
  context.globalThis = context;

  const vmContext = vm.createContext(context);
  for (const file of files) {
    vm.runInContext(readFileSync(file, 'utf8'), vmContext, { filename: file });
  }

  return { context: vmContext, localStorage, openedUrls, window };
}

export function createStoreHarness({ storedState } = {}) {
  let hookState;
  let initialized = false;
  const effects = [];
  const React = {
    useState(initializer) {
      if (!initialized) {
        hookState = typeof initializer === 'function' ? initializer() : initializer;
        initialized = true;
      }
      const setState = (next) => {
        hookState = typeof next === 'function' ? next(hookState) : next;
      };
      return [hookState, setState];
    },
    useEffect(fn) {
      effects.push(fn);
      fn();
    },
    useCallback(fn) {
      return fn;
    },
    useRef(initialValue) {
      return { current: initialValue };
    },
    useMemo(fn) {
      return fn();
    },
  };

  const initialStorage = storedState
    ? { dinner_by_destiny_v1: JSON.stringify(storedState) }
    : {};
  const env = loadBrowserFiles(['data.js', 'theme.js', 'store.jsx'], {
    React,
    localStorage: createLocalStorage(initialStorage),
  });

  return {
    ...env,
    getHookState() {
      return hookState;
    },
    renderStore() {
      return env.window.useStore();
    },
    effects,
  };
}
