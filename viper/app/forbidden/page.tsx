type Props = {
  searchParams: Promise<{ as?: string; route?: string; reason?: string }>;
};

export default async function ForbiddenPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main>
      <h1>403 Forbidden</h1>
      <p>현재 역할로는 이 경로 접근이 허용되지 않습니다.</p>
      <div className="card">
        <div>role: <code>{params.as ?? "-"}</code></div>
        <div>route: <code>{params.route ?? "-"}</code></div>
        <div>reason: <code>{params.reason ?? "-"}</code></div>
      </div>
    </main>
  );
}
