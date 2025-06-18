import { App } from 'antd';
import React from 'react'
import { useSerial, type DataBitsType, type EnterSendsType, type StopBitsType } from '../hooks/useSerial';

export default function SerialConnection() {
  const [baud, setBaud] = React.useState(115200);
  const [flowControl, setFlowControl] = React.useState<FlowControlType>("none");
  const [parity, setParity] = React.useState<ParityType>("none");
  const [dataBits, setDataBits] = React.useState<DataBitsType>(8);
  const [stopBits, setStopBits] = React.useState<StopBitsType>(1);
  const [enterSends, setEnterSends] = React.useState<EnterSendsType>("\r\n");
  const { notification } = App.useApp();
  const { openConnection } = useSerial();

  async function connect() {
    openConnection(
      baud,
      flowControl,
      parity,
      dataBits,
      stopBits,
      enterSends
    )
      .catch((error) => {
        notification.error({
        message: "Connection Error",
        description: `Failed to connect to serial port: ${error instanceof Error ? error.message : String(error)}`,
        duration: 5,
      })
      })
  }

  return (
    <div className="p-2 flex flex-col bg-gray-300 text-black gap-1">
      <p className="font-semibold mb-4">
        Serial Connection
      </p>
      <div>
        <label htmlFor="baud" className="font-semibold mr-2">
          Baud Rate
        </label>
        <select className="border-1 black" name="baud" value={baud} onChange={(e) => setBaud(Number(e.target.value))}>
          <option value={2400}>2400</option>
          <option value={4800}>4800</option>
          <option value={9600}>9600</option>
          <option value={19200}>19200</option>
          <option value={38400}>38400</option>
          <option value={57600}>57600</option>
          <option value={115200}>115200</option>
          <option value={230400}>230400</option>
          <option value={460800}>460800</option>
          <option value={921600}>921600</option>
        </select>
      </div>
      <div>
        <label htmlFor="flowControl" className="font-semibold mr-2">
          Flow Control
        </label>
        <select className="border-1 black" name="flowControl" value={flowControl} onChange={(e) => setFlowControl(e.target.value as FlowControlType)}>
          <option value="none">None</option>
          <option value="hardware">Hardware</option>
        </select>
      </div>
      <div>
        <label htmlFor="parity" className="font-semibold mr-2">
          Parity
        </label>
        <select className="border-1 black" name="parity" value={parity} onChange={(e) => setParity(e.target.value as ParityType)}>
          <option value="none">None</option>
          <option value="even">Even</option>
          <option value="odd">Odd</option>
          <option value="mark">Mark</option>
          <option value="space">Space</option>
        </select>
      </div>
      <div>
        <label htmlFor="dataBits" className="font-semibold mr-2">
          Data Bits
        </label>
        <select className="border-1 black" name="dataBits" value={dataBits} onChange={(e) => setDataBits(Number(e.target.value) as DataBitsType)}>
          <option value={7}>7</option>
          <option value={8}>8</option>
        </select>
      </div>
      <div>
        <label htmlFor="stopBits" className="font-semibold mr-2">
          Stop Bits
        </label>
        <select className="border-1 black" name="stopBits" value={stopBits} onChange={(e) => setStopBits(Number(e.target.value) as StopBitsType)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </div>
      <div>
        <label htmlFor="enterSends" className="font-semibold mr-2">
          Enter Sends
        </label>
        <select className="border-1 black" name="enterSends" value={enterSends} onChange={(e) => setEnterSends(e.target.value as EnterSendsType)}>
          <option value={""}>None</option>
          <option value={"\r"}>CR</option>
          <option value={"\n"}>LF</option>
          <option value={"\r\n"}>CRLF</option>
        </select>
      </div>
      <button className="bg-green-600 p-4 px-2 text-white" onClick={() => connect()}>
        Connect
      </button>
    </div>
  )
}
