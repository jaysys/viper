import type { MenuGroup } from "@/lib/menu";

type Props = {
  title: string;
  groups: MenuGroup[];
};

export default function MenuPreview({ title, groups }: Props) {
  return (
    <div className="card">
      <strong>{title}</strong>
      {groups.length === 0 ? <p>노출 메뉴 없음</p> : null}
      {groups.map((group) => (
        <div key={group.title}>
          <p><b>{group.title}</b></p>
          <ul>
            {group.items.map((item) => (
              <li key={item.label}><code>{item.label}</code> - {item.href}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
