import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

export function DashboardSidebar({
  className,
  collapsed = false,
  ...props
}: DashboardSidebarProps) {
  return (
    <div
      className={cn(
        "h-screen border-r border-muted/30 bg-card/90 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    />
  );
}

interface DashboardSidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

export function DashboardSidebarHeader({
  className,
  collapsed = false,
  ...props
}: DashboardSidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-muted/30 px-4",
        collapsed ? "justify-center" : "justify-between",
        className
      )}
      {...props}
    />
  );
}

interface DashboardSidebarNavProps
  extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

export function DashboardSidebarNav({
  className,
  collapsed = false,
  ...props
}: DashboardSidebarNavProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 p-2",
        collapsed && "items-center",
        className
      )}
      {...props}
    />
  );
}

interface DashboardSidebarNavItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  collapsed?: boolean;
  icon?: React.ReactNode;
}

export function DashboardSidebarNavItem({
  className,
  children,
  isActive = false,
  collapsed = false,
  icon,
  ...props
}: DashboardSidebarNavItemProps) {
  return (
    <a
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:bg-secondary/20 hover:text-foreground",
        isActive && "bg-primary/10 text-primary",
        collapsed && "justify-center px-0",
        className
      )}
      {...props}
    >
      {icon}
      {!collapsed && <span>{children}</span>}
      {collapsed && !icon && <span>{children?.toString().charAt(0)}</span>}
    </a>
  );
}

interface DashboardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardContent({
  className,
  ...props
}: DashboardContentProps) {
  return (
    <div
      className={cn("flex-1 overflow-auto p-6", className)}
      {...props}
    />
  );
}

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardHeader({
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-muted/30 px-6",
        className
      )}
      {...props}
    />
  );
}

interface DashboardNavBreadcrumbProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardNavBreadcrumb({
  className,
  ...props
}: DashboardNavBreadcrumbProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

interface DashboardNavBreadcrumbItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}

export function DashboardNavBreadcrumbItem({
  className,
  isActive = false,
  ...props
}: DashboardNavBreadcrumbItemProps) {
  return (
    <a
      className={cn(
        "hover:text-foreground",
        isActive && "font-medium text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface DashboardNavBreadcrumbSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardNavBreadcrumbSeparator({
  className,
  ...props
}: DashboardNavBreadcrumbSeparatorProps) {
  return (
    <div
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      /
    </div>
  );
}

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardCard({
  className,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-muted/30 bg-card/90 p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

interface DashboardCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardCardHeader({
  className,
  ...props
}: DashboardCardHeaderProps) {
  return (
    <div
      className={cn("mb-4 flex items-center", className)}
      {...props}
    />
  );
}

interface DashboardCardIconProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardCardIcon({
  className,
  ...props
}: DashboardCardIconProps) {
  return (
    <div
      className={cn(
        "mr-4 rounded-md bg-primary/10 p-2 text-primary",
        className
      )}
      {...props}
    />
  );
}

interface DashboardCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardCardContent({
  className,
  ...props
}: DashboardCardContentProps) {
  return <div className={cn("", className)} {...props} />;
}

interface DashboardCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function DashboardCardTitle({
  className,
  ...props
}: DashboardCardTitleProps) {
  return (
    <h3
      className={cn("font-semibold text-lg", className)}
      {...props}
    />
  );
}

interface DashboardCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function DashboardCardDescription({
  className,
  ...props
}: DashboardCardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardGrid({
  className,
  ...props
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    />
  );
}

interface DashboardTableProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardTable({
  className,
  ...props
}: DashboardTableProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-muted/30 bg-card/90 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

interface DashboardTableHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardTableHeader({
  className,
  ...props
}: DashboardTableHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-muted/30 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

interface DashboardTableTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function DashboardTableTitle({
  className,
  ...props
}: DashboardTableTitleProps) {
  return (
    <h3
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

interface DashboardTableDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function DashboardTableDescription({
  className,
  ...props
}: DashboardTableDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface DashboardTableContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardTableContent({
  className,
  ...props
}: DashboardTableContentProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

interface DashboardTableFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardTableFooter({
  className,
  ...props
}: DashboardTableFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-muted/30 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Dashboard({
  className,
  ...props
}: DashboardProps) {
  return (
    <div
      className={cn("flex h-screen overflow-hidden", className)}
      {...props}
    />
  );
}

interface DashboardMainProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardMain({
  className,
  ...props
}: DashboardMainProps) {
  return (
    <main
      className={cn("flex flex-1 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}