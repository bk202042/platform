"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

interface ProfileDetailsProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      phone?: string;
      role?: string;
    };
    last_sign_in_at?: string;
  };
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [passwordFields, setPasswordFields] = useState({
    current: "",
    new: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user.user_metadata?.full_name || "",
    phone: user.user_metadata?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
      });

      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: "프로필이 성공적으로 업데이트되었습니다.",
      });

      router.refresh();
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          "프로필 업데이트 중 오류가 발생했습니다: " + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailStatus("A confirmation email has been sent to your new address.");
      setShowEmailModal(false);
      router.refresh();
    } catch (err) {
      setEmailStatus("Failed to update email: " + (err as Error).message);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordFields.new,
      });
      if (error) throw error;
      setPasswordStatus("Password updated successfully.");
      setShowPasswordModal(false);
      setPasswordFields({ current: "", new: "" });
    } catch (err) {
      setPasswordStatus("Failed to update password: " + (err as Error).message);
    }
  };

  return (
    <>
      {/* Email Edit Modal */}
      {showEmailModal && (
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Edit Email</h2>
              <form onSubmit={handleEmailSave} className="space-y-4">
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter new email"
                  title="New email address"
                />
                {emailStatus && (
                  <div className="text-sm text-red-600">{emailStatus}</div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#007882] hover:bg-[#005F67] text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
      {/* Password Edit Modal */}
      {showPasswordModal && (
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <input
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
                  value={passwordFields.current}
                  onChange={(e) =>
                    setPasswordFields((f) => ({
                      ...f,
                      current: e.target.value,
                    }))
                  }
                  placeholder="Current Password"
                  title="Current password"
                  autoFocus
                />
                <input
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882]"
                  value={passwordFields.new}
                  onChange={(e) =>
                    setPasswordFields((f) => ({ ...f, new: e.target.value }))
                  }
                  placeholder="New Password"
                  title="New password"
                  required
                />
                {passwordStatus && (
                  <div className="text-sm text-red-600">{passwordStatus}</div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#007882] hover:bg-[#005F67] text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full space-y-10 bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8"
        aria-label="Edit Profile Form"
      >
        {/* Email & Password */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <div id="profile-email" className="text-gray-900 text-base">
                {user.email}
              </div>
            </div>
            <button
              type="button"
              className="text-blue-600 text-sm font-semibold hover:underline focus:underline focus:outline-none transition-colors duration-150"
              onClick={() => setShowEmailModal(true)}
              aria-label="Edit Email"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="profile-password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div id="profile-password" className="text-gray-900 text-base">
                ********
              </div>
            </div>
            <button
              type="button"
              className="text-blue-600 text-sm font-semibold hover:underline focus:underline focus:outline-none transition-colors duration-150"
              onClick={() => setShowPasswordModal(true)}
              aria-label="Edit Password"
            >
              Edit
            </button>
          </div>
        </div>
        {/* Editable Fields */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="profile-fullname"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              name="fullName"
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882] transition-colors duration-150"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              autoComplete="name"
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="profile-phone"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              name="phone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007882] transition-colors duration-150"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              aria-required="false"
            />
          </div>
        </div>
        {/* Feedback */}
        {statusMessage && (
          <div
            className={`rounded-md p-4 mt-2 text-sm ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
            aria-live="polite"
            role="alert"
            tabIndex={-1}
          >
            {statusMessage.text}
          </div>
        )}
        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#007882] hover:bg-[#005F67] min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#007882] focus:ring-offset-2 transition-colors duration-150 shadow-sm"
            disabled={isLoading}
            aria-label="Save Changes"
          >
            {isLoading ? "저장 중..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
