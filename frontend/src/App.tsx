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
        'flex flex-col md:flex-row items-center rounded-2xl text-center gap-2 md:gap-4 inset-0 md:inset-8 absolute overflow-hidden',
        )}
        style={{
          backgroundColor: '#d7d2c8',
          boxShadow: "inset -5px -5px 10px #908d86, inset 5px 5px 10px #ffffff",
        }}
        >
        <div className='p-1 w-full md:w-2/3 h-2/3 md:h-full'>
          <div className="h-full w-full bg-gray-800 p-4 pb-0 md:pb-4 md:pr-0 flex flex-col md:flex-row rounded-xl">
            <div className="bg-black w-full h-full rounded-lg flex flex-row justify-center items-center overflow-hidden">
              { renderContent() }
            </div>
            <h1 className='text-lg md:text-4xl font-orbitron text-white md:[writing-mode:sideways-lr] py-2 md:py-4'>
              ChirpyRF
            </h1>
          </div>
        </div>
        <div className="w-full md:w-1/3 h-2/3 md:h-full">
          <Controls />
        </div>
      </div>
    </div>
  )
}

export default App
