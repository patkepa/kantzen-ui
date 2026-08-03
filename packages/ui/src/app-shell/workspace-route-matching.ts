export function isWorkspacePathActive(href: string, pathname: string) {
  const pathEnd = href.search(/[?#]/);
  const hrefPath = pathEnd === -1 ? href : href.slice(0, pathEnd);
  const normalizedHref =
    hrefPath.length > 1 ? hrefPath.replace(/\/+$/, "") : hrefPath;

  if (normalizedHref === "/") return pathname === "/";
  return (
    pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
  );
}
