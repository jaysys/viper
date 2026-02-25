import type { Role } from "@/lib/authz";

export type MenuGroup = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

const portalBase: MenuGroup[] = [
  { title: "대시보드", items: [{ label: "내 현황", href: "/portal/dashboard" }] },
  {
    title: "촬영요청",
    items: [
      { label: "요청 생성", href: "/portal/requests/new" },
      { label: "주문/작전 모니터링", href: "/portal/orders" },
      { label: "템플릿", href: "/portal/templates" }
    ]
  }
];

const opsBase: MenuGroup[] = [
  { title: "운영대시보드", items: [{ label: "통합 대시보드", href: "/ops/dashboard" }] },
  {
    title: "위성작전",
    items: [
      { label: "작전지시(Uplink)", href: "/ops/tasking/uplink" },
      { label: "수신·처리·QA", href: "/ops/tasking/reception" }
    ]
  }
];

export function getPortalMenu(role: Role): MenuGroup[] {
  if (role === "operator" || role === "approver" || role === "admin") return portalBase;
  return portalBase;
}

export function getOpsMenu(role: Role): MenuGroup[] {
  if (role === "requester") return [];
  return opsBase;
}
