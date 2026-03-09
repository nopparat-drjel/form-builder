import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import NeuInput from "@/components/ui/NeuInput";
import NeuButton from "@/components/ui/NeuButton";
import { I } from "@/components/ui/Icon";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success("เข้าสู่ระบบสำเร็จ");
      navigate("/dashboard", { replace: true });
    } catch {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-700 shadow-neu flex items-center justify-center">
            <I name="article" size={32} fill={1} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-green-900">HR FormKit</h1>
            <p className="text-sm text-gray-500 mt-0.5">ระบบจัดการแบบฟอร์ม HR</p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#f5f5f5] rounded-3xl shadow-neu p-8 flex flex-col gap-5"
          noValidate
        >
          <h2 className="text-base font-semibold text-gray-700 text-center">
            เข้าสู่ระบบ
          </h2>

          <NeuInput
            label="อีเมล"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            icon="mail"
            required
            autoComplete="email"
          />

          <NeuInput
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon="lock"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-xs text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          <NeuButton
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            เข้าสู่ระบบ
          </NeuButton>
        </form>
      </div>
    </div>
  );
}
