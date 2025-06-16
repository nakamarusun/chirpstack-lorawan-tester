import useAuth from './hooks/useAuth';
import clsx from 'clsx';
import Login from './components/Login';
import { Spin } from 'antd';

function App() {
  const {state: authState} = useAuth();

  function renderContent() {
    switch (authState) {
      case "idle":
        return <Spin />;
      case "loggedout":
        return <Login />;
    }

    return <div className='text-green-500'>Anda sudah masuk.</div>;
  }

  return (
    <div className='w-full flex flex-col items-center min-h-screen justify-center'>
      <div className={clsx(
        'flex flex-col items-center bg-gray-100 shadow-xl rounded-md p-8 text-center md:w-sm w-[90%]',
        )}>
        { renderContent() }
      </div>
    </div>
  )
}

export default App
