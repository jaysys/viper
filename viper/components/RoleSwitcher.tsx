import Link from "next/link";
import { roleSwitchLinks, type Role } from "@/lib/authz";

type Props = {
  role: Role;
  path: string;
};

export default function RoleSwitcher({ role, path }: Props) {
  const quickLinks = [
    { label: "SCR-001 Portal(요약)", href: `/portal/dashboard?as=${role}`, title: "대상: requester/operator/approver/admin" },
    { label: "SCR-002 요청생성", href: `/portal/requests/new?as=${role}`, title: "대상: requester/operator/admin" },
    { label: "SCR-003 타당성", href: `/portal/feasibility/REQ-20260225-001?as=${role}`, title: "대상: requester/operator/approver/admin (requester는 owner only)" },
    { label: "SCR-004 견적/승인", href: `/portal/quotes/REQ-20260225-001?as=${role}`, title: "조회: requester/operator/approver/admin, 승인실행: approver/admin" },
    { label: "SCR-005 주문모니터링", href: `/portal/orders?as=${role}`, title: "대상: requester/operator/approver/admin" },
    { label: "SCR-006 캡처검수", href: `/portal/orders/REQ-20260225-002/captures?as=${role}`, title: "조회: requester/operator/approver/admin, 검수수정: operator/admin" },
    { label: "SCR-007 Portal 템플릿", href: `/portal/templates?as=${role}`, title: "조회: requester/operator/approver/admin, 생성/수정: requester/operator/admin" },
    { label: "SCR-001 Ops(통합)", href: `/ops/dashboard?as=${role}`, title: "대상: operator/approver/admin (내부 전용)" },
    { label: "SCR-007 Ops 템플릿", href: `/ops/templates?as=${role}`, title: "조회: operator/approver/admin, 수정: operator/admin (내부 전용)" },
    { label: "SCR-009 Uplink", href: `/ops/tasking/uplink?as=${role}`, title: "조회: operator/approver/admin, 실행: operator/admin" },
    { label: "SCR-010 Reception", href: `/ops/tasking/reception?as=${role}`, title: "조회: operator/approver/admin, 처리수정: operator/admin" },
    { label: "SCR-008 Admin", href: `/ops/admin?as=${role}`, title: "대상: admin 전용" }
  ];

  return (
    <div className="card">
      <strong>역할 전환</strong>
      <div className="row">
        {roleSwitchLinks(path).map((item) => (
          <Link key={item.role} href={item.href} className={item.role === role ? "pill active" : "pill"}>
            {item.role}
          </Link>
        ))}
      </div>

      <strong>화면 빠른 이동</strong>
      <div className="row">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="pill" title={item.title}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
