import { App, Button, Input } from 'antd'
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
    <div className="flex flex-col items-start w-full">
      <h1 className='text-2xl font-bold mb-4'>
        Chirpy the Helper
      </h1>
      <p className="text-sm font-semibold mb-1">
        Password
      </p>
      <Input.Password
        placeholder="Password"
        className='mb-4'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onPressEnter={submit}
      />
      <div className="flex flex-row justify-end w-full">
        <Button type="primary" size='large' onClick={submit}>
          Login
        </Button>
      </div>
    </div>
  )
}
