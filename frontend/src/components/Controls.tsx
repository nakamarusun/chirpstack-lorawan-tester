import { useEffect, useState } from 'react';
import useLoRaWAN from '../hooks/useLoRaWAN'
import Keycap from './Keycap';
import { App } from 'antd';
import { nanoIDRandomHex } from '../tools';

export default function Controls() {
  const lorawan = useLoRaWAN();

  const [tempFreq, setTempFreq] = useState(lorawan.frequency);
  const [tempSF, setTempSF] = useState(lorawan.dataRate);
  const [tempTxPower, setTempTxPower] = useState(lorawan.txPower);

  const [fPort, setFPort] = useState(10);
  const [payload, setPayload] = useState("0101010101");
  const [randomNumber, setRandomNumber] = useState(10);

  const { notification } = App.useApp();

  useEffect(() => {
    setTempFreq(lorawan.frequency);
  }, [lorawan.frequency]);

  useEffect(() => {
    setTempSF(lorawan.dataRate);
  }, [lorawan.dataRate]);

  useEffect(() => {
    setTempTxPower(lorawan.txPower);
  }, [lorawan.txPower]);

  async function sendText() {
    // Check if the payload is empty
    const newPayload = payload.trim();

    // Check if payload is hex
    if (!/^[0-9A-Fa-f]*$/.test(newPayload)) {
      notification.error({
        message: 'Invalid Payload',
        description: 'Payload must be a valid hexadecimal string.',
        duration: 3,
      });
      return;
    }

    // Check if fport is valid
    if (fPort < 1 || fPort > 255) {
      notification.error({
        message: 'Invalid fPort',
        description: 'fPort must be between 1 and 255.',
        duration: 3,
      });
      return;
    }

    // Check if payload is too long
    if (newPayload.length > 255*2) {
      notification.error({
        message: 'Invalid Payload',
        description: 'Payload must be less than 255 characters.',
        duration: 3,
      });
      return;
    }

    // Check if there are changes in frequency, SF, or TX power
    if (tempFreq != lorawan.frequency) {
      try {
        await lorawan.setFrequency(tempFreq);
      } catch (error) {
        setTempFreq(lorawan.frequency);
        notification.error({
          message: 'Invalid Frequency',
          description: 'Frequency must be between 400000000 and 950000000 Hz.',
          duration: 3,
        });
        return;
      }
    }
    if (tempSF != lorawan.dataRate) {
      try {
        await lorawan.setDR(tempSF);
      } catch (error) {
        setTempSF(lorawan.dataRate);
        notification.error({
          message: 'Invalid Data Rate',
          description: 'Data Rate must be between 0 (SF12) and 5 (SF7).',
          duration: 3,
        });
        return;
      }
    }
    if (tempTxPower != lorawan.txPower) {
      try {
        await lorawan.setTxPower(tempTxPower);
      } catch (error) {
        setTempTxPower(lorawan.txPower);
        notification.error({
          message: 'Invalid TX Power',
          description: 'TX Power must be between 0 and 22 dBm.',
          duration: 3,
        });
        return;
      }
    }

    await lorawan.send(fPort, newPayload);
  }
  async function sendResetKeys() {
    await lorawan.resetKeys();
    notification.success({
      message: 'Keys Reset',
      description: 'Device keys have been reset successfully.',
      duration: 3,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col justify-center md:pr-8 px-8">
        <div className="flex flex-row items-center w-full mb-8">
          <label className='font-source-code-pro text-xl mr-4' htmlFor="freq">Frequency</label>
          <input name="freq" className='px-2 py-1 w-full bg-stone-900 text-white text-xl border-0' value={tempFreq} onChange={(e) => setTempFreq(Number(e.target.value))} />
        </div>
        <div className="flex flex-row items-center w-full mb-8">
          <label className='font-source-code-pro text-xl mr-4' htmlFor="sf">SF</label>
          {/* Make this a stepped slider later */}
          <select name="sf" className='px-2 py-1 bg-stone-900 text-white text-xl border-0' value={tempSF} onChange={(e) => setTempSF(Number(e.target.value))}>
            <option value={5}>SF7</option>
            <option value={4}>SF8</option>
            <option value={3}>SF9</option>
            <option value={2}>SF10</option>
            <option value={1}>SF11</option>
            <option value={0}>SF12</option>
          </select>
        </div>
        <div className="flex flex-row items-center w-full mb-8">
          <label className='font-source-code-pro text-xl mr-4' htmlFor="txpower">TX Power</label>
          {/* Make this a dial later */}
          <select
            name="txpower"
            className='px-2 py-1 bg-stone-900 text-white text-xl border-0'
            value={tempTxPower}
            onChange={(e) => setTempTxPower(Number(e.target.value))}
          >
            <option value={22}>22</option>
            <option value={20}>20</option>
            <option value={18}>18</option>
            <option value={16}>16</option>
            <option value={14}>14</option>
            <option value={12}>12</option>
            <option value={10}>10</option>
            <option value={8}>8</option>
            <option value={6}>6</option>
            <option value={4}>4</option>
            <option value={2}>2</option>
            <option value={0}>0</option>
          </select>
        </div>
        <div className="flex flex-row items-center w-full gap-4">
          <div className="w-full flex flex-col items-start">
            <p className="font-semibold font-source-code-pro text-xl">Payload</p>
            <input value={payload} onChange={(e) => setPayload(e.target.value)} type="text" className="w-full px-2 py-1 bg-stone-900 text-white text-xl border-0" />
          </div>
          <div className="w-16 flex flex-col items-start">
            <p className="font-semibold font-source-code-pro text-xl">fPort</p>
            <input value={fPort} onChange={(e) => setFPort(Number(e.target.value))} type="text" className="w-full px-2 py-1 bg-stone-900 text-white text-xl border-0" />
          </div>
        </div>
        <div className="flex flex-row justify-end gap-4 mt-2">
          <Keycap onClick={() => setPayload("")}>
            Clear
          </Keycap>
          <Keycap onClick={sendResetKeys}>
            Reset keys
          </Keycap>
          <Keycap onClick={sendText}>
            Send
          </Keycap>
        </div>
        <div className="flex flex-row items-center justify-end gap-4 mt-2">
          <Keycap onClick={() => setPayload(nanoIDRandomHex(randomNumber * 2))}>
            Randomize
          </Keycap>
          <input
            className="px-2 py-1 bg-stone-900 text-white text-xl border-0 w-24"
            value={randomNumber}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num) && num > 0) {
                setRandomNumber(num);
              }
              if (e.target.value === "") {
                setRandomNumber(0);
              }
            }}
            name="randomNumber"
          />
          <label htmlFor="randomNumber" className="font-source-code-pro text-lg">Bytes</label>
          </div>
      </div>
      <div className="flex flex-col w-full md:items-end">
        <p className="bg-stone-800/20 py-0.5 md:py-1 px-2 md:px-4 text-base md:text-2xl md:rounded-tl-2xl font-source-code-pro font-bold inset-shadow-sm border-t-3 md:border-l-3 text-stone-800">
          <span className="mr-4">DEVEUI</span>
          <span className="">{lorawan.devEui}</span>
        </p>
      </div>
    </div>
  )
}
