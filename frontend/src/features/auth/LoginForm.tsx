import React, { useState } from 'react';
import { User2Icon, Lock, ArrowRight } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { login } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <Input
        label="Email"
        type="email"
        icon={User2Icon}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <Input
        label="Mật khẩu"
        type="password"
        icon={Lock}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-indigo-600"
          />
          <span className="text-slate-600">Ghi nhớ</span>
        </label>
        <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700">
          Quên mật khẩu?
        </a>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner size={18} />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <span>Đăng nhập</span>
            <ArrowRight size={18} />
          </>
        )}
      </Button>
    </form>
  );
};