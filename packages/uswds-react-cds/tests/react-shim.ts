/**
 * Zero-dependency hermetic React runtime shim for headless unit testing
 */

export const Fragment = Symbol.for('react.fragment');

export function useState<T>(initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  return [initial, () => {}];
}

export function createElement(type: any, props?: any, ...children: any[]): any {
  const mergedProps = { ...(props || {}) };
  if (children.length > 0) {
    mergedProps.children = children.length === 1 ? children[0] : children;
  }
  return {
    type,
    props: mergedProps,
  };
}

export function jsx(type: any, props: any, key?: any): any {
  return {
    type,
    props: { ...props, ...(key !== undefined ? { key } : {}) },
  };
}

export const jsxs = jsx;
export const jsxDEV = (type: any, props: any, key?: any) => {
  return {
    type,
    props: { ...props, ...(key !== undefined ? { key } : {}) },
  };
};

export const React = {
  createElement,
  useState,
  Fragment,
  jsx,
  jsxs,
  jsxDEV,
};

export default React;

export function renderToString(node: any): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(renderToString).join('');
  }
  if (node.type === Fragment || !node.type) {
    return renderToString(node.props?.children);
  }
  if (typeof node.type === 'function') {
    return renderToString(node.type(node.props || {}));
  }
  if (typeof node.type === 'string') {
    const props = node.props || {};
    const attrs = Object.entries(props)
      .filter(([k, v]) => k !== 'children' && k !== 'key' && v !== undefined && typeof v !== 'function')
      .map(([k, v]) => {
        if (k === 'className') return `class="${v}"`;
        return `${k}="${v}"`;
      })
      .join(' ');

    const openTag = attrs ? `<${node.type} ${attrs}>` : `<${node.type}>`;
    const childrenStr = renderToString(props.children);
    return `${openTag}${childrenStr}</${node.type}>`;
  }
  return '';
}
