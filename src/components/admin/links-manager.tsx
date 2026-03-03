"use client";

import { useState } from "react";

type LinkItem = {
  id: string;
  platform: string;
  label: string;
  url: string;
  visible: boolean;
  sortOrder: number;
};

const platforms = ["github", "twitter", "bilibili", "xiaohongshu", "jike", "zhihu", "youtube", "email", "wechat", "custom"];

export function LinksManager({ initial }: { initial: LinkItem[] }) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  async function update(item: LinkItem) {
    const response = await fetch(`/api/links/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    setMessage(response.ok ? "已更新" : "更新失败");
  }

  async function remove(id: string) {
    if (!window.confirm("确认删除该社交链接？此操作不可恢复。")) return;

    const response = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage("已删除");
    } else {
      setMessage("删除失败");
    }
  }

  async function create() {
    setCreating(true);
    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "custom", label: "New Link", url: "https://", visible: true, sortOrder: items.length + 1 })
    });

    setCreating(false);
    if (!response.ok) {
      setMessage("创建失败");
      return;
    }

    const created = (await response.json()) as LinkItem;
    setItems((prev) => [...prev, created]);
    setMessage("已创建");
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-3">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={create} disabled={creating}>
          {creating ? "创建中..." : "+ 新建链接"}
        </button>
        <span className="text-sm text-slate-500">{message}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2 align-middle">平台</th>
              <th className="align-middle">名称</th>
              <th className="align-middle">URL</th>
              <th className="align-middle">显示</th>
              <th className="align-middle">排序</th>
              <th className="align-middle">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b align-middle">
                <td className="py-2">
                  <select
                    className="rounded border border-slate-300 px-2 py-1"
                    value={item.platform}
                    onChange={(e) =>
                      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, platform: e.target.value } : row)))
                    }
                  >
                    {platforms.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 align-middle">
                  <input
                    className="w-32 rounded border border-slate-300 px-2 py-1"
                    value={item.label}
                    onChange={(e) =>
                      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, label: e.target.value } : row)))
                    }
                  />
                </td>
                <td className="py-2 align-middle">
                  <input
                    className="w-64 rounded border border-slate-300 px-2 py-1"
                    value={item.url}
                    onChange={(e) =>
                      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, url: e.target.value } : row)))
                    }
                  />
                </td>
                <td className="py-2 align-middle">
                  <div className="flex h-full items-center">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, visible: e.target.checked } : row)))
                      }
                    />
                  </div>
                </td>
                <td className="py-2 align-middle">
                  <input
                    type="number"
                    className="w-20 rounded border border-slate-300 px-2 py-1"
                    value={item.sortOrder}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row) =>
                          row.id === item.id ? { ...row, sortOrder: Number.parseInt(e.target.value || "0", 10) } : row
                        )
                      )
                    }
                  />
                </td>
                <td className="space-x-2 py-2 align-middle">
                  <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={() => update(item)}>
                    保存
                  </button>
                  <button className="rounded bg-rose-600 px-3 py-1 text-white" onClick={() => remove(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
