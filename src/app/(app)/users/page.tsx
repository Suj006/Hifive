"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApi, apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import type { AppUser, UserRole } from "@/lib/types";
import { IconPlus, IconTrash, IconLock, IconUsers } from "@/components/icons";

export default function UsersPage() {
  const { data: me } = useApi<{ username: string; role: UserRole }>("/api/auth/me");
  const { data, loading, error, refetch } = useApi<AppUser[]>("/api/users");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetting, setResetting] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleSaving, setRoleSaving] = useState<string | null>(null);
  const { push } = useToast();
  const users = data ?? [];

  async function handleRoleChange(user: AppUser, role: UserRole) {
    setRoleSaving(user.id);
    try {
      await apiRequest(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      push(`${user.username} is now ${role === "ADMIN" ? "an Admin" : "a Viewer"}`);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not update role", "error");
    } finally {
      setRoleSaving(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/users/${deleting.id}`, { method: "DELETE" });
      push("Account removed");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not remove account", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Team access"
        description="Give family or staff a login — Admins can add and edit everything, Viewers can only look."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <IconPlus className="h-4 w-4" /> Add account
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<IconUsers className="h-6 w-6 text-brand-purple-2" />}
            title="No accounts yet"
            description="Add a login for someone who should only be able to view the data."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <IconPlus className="h-4 w-4" /> Add account
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Added</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.username === me?.username;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5 font-medium">
                        {u.username}
                        {isSelf ? (
                          <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5">
                        {isSelf ? (
                          <Badge tone={u.role === "ADMIN" ? "gold" : "teal"}>
                            {u.role === "ADMIN" ? "Admin" : "Viewer"}
                          </Badge>
                        ) : (
                          <Select
                            value={u.role}
                            disabled={roleSaving === u.id}
                            onChange={(e) =>
                              handleRoleChange(u, e.target.value as UserRole)
                            }
                            className="!h-8 w-32 text-xs"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="VIEWER">Viewer</option>
                          </Select>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setResetting(u)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                            aria-label="Reset password"
                          >
                            <IconLock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => !isSelf && setDeleting(u)}
                            disabled={isSelf}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
      />

      <ResetPasswordModal
        user={resetting}
        onClose={() => setResetting(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove this account?"
        description={`"${deleting?.username}" will no longer be able to sign in.`}
        loading={deleteLoading}
      />
    </div>
  );
}

function CreateUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add an account" size="sm">
      {open ? <CreateUserForm onClose={onClose} onCreated={onCreated} /> : null}
    </Modal>
  );
}

function CreateUserForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("VIEWER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      });
      push("Account created");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Username">
        <Input required value={username} onChange={(e) => setUsername(e.target.value)} />
      </Field>
      <Field label="Password" hint="At least 6 characters">
        <Input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="Role" hint="Viewers can look but not add, edit or delete anything.">
        <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="VIEWER">Viewer — read only</option>
          <option value="ADMIN">Admin — full access</option>
        </Select>
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create account"}
        </Button>
      </div>
    </form>
  );
}

function ResetPasswordModal({
  user,
  onClose,
}: {
  user: AppUser | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!user} onClose={onClose} title={`Reset password${user ? ` — ${user.username}` : ""}`} size="sm">
      {user ? <ResetPasswordForm user={user} onClose={onClose} /> : null}
    </Modal>
  );
}

function ResetPasswordForm({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      });
      push(`Password reset for ${user.username}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New password" hint="At least 6 characters">
        <Input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Reset password"}
        </Button>
      </div>
    </form>
  );
}
