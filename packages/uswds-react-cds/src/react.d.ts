declare namespace JSX {
  interface Element extends Record<string, any> {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace React {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export function useState<T>(initial: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export const Fragment: any;
  export function createElement(type: any, props?: any, ...children: any[]): any;
}

declare module 'react' {
  export = React;
}

declare module 'react/jsx-runtime' {
  export const jsx: (type: any, props: any, key?: any) => any;
  export const jsxs: (type: any, props: any, key?: any) => any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: (type: any, props: any, key?: any, isStatic?: boolean, source?: any, self?: any) => any;
  export const Fragment: any;
}
