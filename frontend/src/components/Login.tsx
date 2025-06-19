import { App } from 'antd'
import { useState } from 'react';
import useAuth from '../hooks/useAuth';

export default function Login() {

  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const app = App.useApp();

  function submit() {
    if (!password) {
      return;
    }

    login(password)
      .catch((error) => {
        app.notification.error({
          message: "Login Gagal",
          description: `Error: ${error.message}`,
          duration: 5,
        });
      });
  }

  return (
    <div className="flex flex-col items-start w-fit">
      <p className="text-sm font-semibold mb-1">
        Password
      </p>
      <input
        placeholder="Password"
        className='mb-4 font-source-code-pro bg-gray-200 px-2 py-1 text-lg'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        type="password"
        autoFocus
      />
      <div className="flex flex-row w-full">
        <button onClick={submit} className="w-full font-source-code-pro bg-gray-400 font-bold py-1 text-lg">
          Login
        </button>
      </div>
    </div>
  )
}
