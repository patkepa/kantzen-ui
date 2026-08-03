import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type SVGAttributes,
} from "react";
import {
  Icons,
  IconSize,
  type IconName,
  type IconPaths,
} from "@blueprintjs/icons";

export interface IconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "color"
> {
  icon: IconName | ReactElement | null | false;
  size?: number;
  color?: string;
  title?: string;
  htmlTitle?: string;
  tagName?: "span" | null;
  svgProps?: SVGAttributes<SVGSVGElement>;
  autoLoad?: boolean;
}

export function Icon({
  autoLoad = true,
  className,
  color,
  icon,
  size = IconSize.STANDARD,
  svgProps,
  tagName = "span",
  title,
  htmlTitle,
  ...htmlProps
}: IconProps) {
  const titleId = useId();
  const iconKey = typeof icon === "string" ? `${icon}:${size}` : undefined;
  const [loadedIcon, setLoadedIcon] = useState<
    { key: string; paths: IconPaths | undefined } | undefined
  >();
  const paths =
    typeof icon === "string"
      ? (Icons.getPaths(icon, size) ??
        (loadedIcon && loadedIcon.key === iconKey
          ? loadedIcon.paths
          : undefined))
      : undefined;

  useEffect(() => {
    if (typeof icon !== "string") return;

    const loadedPaths = Icons.getPaths(icon, size);
    if (loadedPaths || !autoLoad) return;

    let active = true;
    void Icons.load(icon, size).then(() => {
      if (active) {
        setLoadedIcon({
          key: `${icon}:${size}`,
          paths: Icons.getPaths(icon, size),
        });
      }
    });
    return () => {
      active = false;
    };
  }, [autoLoad, icon, size]);

  if (!icon) return null;
  if (typeof icon !== "string") {
    return isValidElement<{ className?: string }>(icon)
      ? cloneElement(icon, {
          className: [icon.props.className, className]
            .filter(Boolean)
            .join(" "),
        })
      : null;
  }

  const supportedSize =
    size < IconSize.LARGE ? IconSize.STANDARD : IconSize.LARGE;
  const iconClassName = [
    "kui-icon",
    "bp6-icon",
    `bp6-icon-${icon}`,
    size === IconSize.STANDARD && "bp6-icon-standard",
    size === IconSize.LARGE && "bp6-icon-large",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const svg = (
    <svg
      aria-labelledby={title ? titleId : undefined}
      data-icon={icon}
      fill={color ?? "currentColor"}
      height={size}
      role={title ? "img" : undefined}
      viewBox={`0 0 ${supportedSize} ${supportedSize}`}
      width={size}
      {...svgProps}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {paths?.map((path, index) => (
        <path d={path} fillRule="evenodd" key={index} />
      ))}
    </svg>
  );

  if (tagName === null) return svg;
  return (
    <span
      aria-hidden={title ? undefined : true}
      {...htmlProps}
      className={iconClassName}
      title={htmlTitle}
    >
      {svg}
    </span>
  );
}
