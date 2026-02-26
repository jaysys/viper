import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Viper UI Prototype</h1>
      <p>
        역할 쿼리파라미터를 붙여 화면 접근을 검증합니다. 예:{" "}
        <code>?as=operator</code>
      </p>
      <div className="grid">
        <div className="card">
          <h2>Portal</h2>
          <ul>
            <li>
              <Link href="/portal/dashboard?as=requester">
                /portal/dashboard
              </Link>
            </li>
            <li>
              <Link href="/portal/requests/new?as=requester">
                /portal/requests/new
              </Link>
            </li>
            <li>
              <Link href="/portal/orders?as=requester">/portal/orders</Link>
            </li>
            <li>
              <Link href="/portal/feasibility/REQ-20260225-001?as=requester">
                /portal/feasibility/:requestId
              </Link>
            </li>
            <li>
              <Link href="/portal/quotes/REQ-20260225-001?as=requester">
                /portal/quotes/:requestId
              </Link>
            </li>
            <li>
              <Link href="/portal/templates?as=requester">
                /portal/templates
              </Link>
            </li>
            <li>
              <Link href="/portal/orders/REQ-20260225-002/captures?as=requester">
                /portal/orders/:requestId/captures
              </Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2>Ops Console</h2>
          <ul>
            <li>
              <Link href="/ops/dashboard?as=operator">/ops/dashboard</Link>
            </li>
            <li>
              <Link href="/ops/requests?as=operator">/ops/requests</Link>
            </li>
            <li>
              <Link href="/ops/tasking/uplink?as=operator">
                /ops/tasking/uplink
              </Link>
            </li>
            <li>
              <Link href="/ops/tasking/reception?as=operator">
                /ops/tasking/reception
              </Link>
            </li>
            <li>
              <Link href="/ops/templates?as=operator">/ops/templates</Link>
            </li>
            <li>
              <Link href="/ops/admin?as=admin">/ops/admin</Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
