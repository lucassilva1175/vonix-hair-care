import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";

type AffiliateApplyLinkProps = Omit<ComponentProps<"a">, "href"> & {
  recruitmentOpen: boolean;
  onSafePreview?: (() => void) | undefined;
  children: ReactNode;
};

/**
 * All public affiliate CTAs share the same honest entry point.
 * OPEN: follow #inscricao, where a server-approved form is rendered.
 * Otherwise: open the local no-POST preview and scroll to its anchor.
 *
 * The click measures anonymous interest only; it is never a successful lead.
 */
export function AffiliateApplyLink({
  recruitmentOpen,
  onSafePreview,
  children,
  onClick,
  title,
  ...props
}: AffiliateApplyLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    trackAffiliateFunnel("affiliate_application_interest");
    if (!recruitmentOpen) onSafePreview?.();
  }

  return (
    <a
      {...props}
      href="#inscricao"
      onClick={handleClick}
      title={
        title ??
        (!recruitmentOpen && onSafePreview
          ? "Abre uma prévia segura do formulário, sem enviar dados"
          : undefined)
      }
    >
      {children}
    </a>
  );
}
