import useAuth from './hooks/useAuth';
import clsx from 'clsx';
import Login from './components/Login';
import { Spin } from 'antd';
import Controls from './components/Controls';
import Terminal from './components/Terminal';

function App() {
  const {state: authState} = useAuth();

  function renderContent() {
    switch (authState) {
      case "idle":
        return <Spin />;
      case "loggedout":
        return <Login />;
    }

    return <Terminal />;
  }

  return (
    <div className='w-full flex flex-col items-center min-h-screen justify-center'>
      <div
        className={clsx(
        'flex flex-row items-center rounded-2xl p-4 text-center gap-4 inset-8 absolute',
        )}
        style={{
          backgroundColor: '#d7d2c8',
          boxShadow: "inset -5px -5px 10px #908d86, inset 5px 5px 10px #ffffff",
        }}
        >
        <div className="bg-black p-4 rounded-lg w-2/3 h-full flex flex-col justify-center items-center">
          { renderContent() }
        </div>
        <Controls />
      </div>
    </div>
  )
}

export default App
