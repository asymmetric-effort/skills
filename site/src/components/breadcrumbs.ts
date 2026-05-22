import { createElement } from '@asymmetric-effort/specifyjs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs(props: { items: BreadcrumbItem[] }) {
  const children: any[] = [];
  props.items.forEach((item, i) => {
    if (i > 0) {
      children.push(createElement('span', { className: 'breadcrumb-sep' }, ' / '));
    }
    if (item.href && i < props.items.length - 1) {
      children.push(createElement('a', { href: item.href, className: 'breadcrumb-link' }, item.label));
    } else {
      children.push(createElement('span', { className: 'breadcrumb-current' }, item.label));
    }
  });
  return createElement('nav', { className: 'breadcrumbs', 'aria-label': 'Breadcrumb' }, ...children);
}
