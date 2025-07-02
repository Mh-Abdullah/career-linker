"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    setError("")
    setSuccess("")
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess("Password updated successfully.")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setError(data.error || "Failed to update password.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} className="bg-white text-black dark:bg-zinc-900 dark:text-white">
      <DialogContent className="bg-white text-black border border-border dark:bg-zinc-900 dark:text-white dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-lg">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded bg-white text-black placeholder:text-black/60 dark:bg-zinc-900 dark:text-white dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded bg-white text-black placeholder:text-black/60 dark:bg-zinc-900 dark:text-white dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded bg-white text-black placeholder:text-black/60 dark:bg-zinc-900 dark:text-white dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </div>
        <DialogFooter>
          <Button onClick={handleChangePassword} disabled={loading} className="bg-[#00A8A8] text-white">
            {loading ? "Updating..." : "Update Password"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}