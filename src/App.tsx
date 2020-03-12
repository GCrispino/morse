import React, { DetailsHTMLAttributes } from 'react';
import './App.css';
import {textToMorse, morseToGap} from './Utils/textToMorse';
import { motion } from 'framer-motion';
import styled from 'styled-components';

type CharType = 'dot' | 'dash';

const base = 4;
const bigB = 3;

const Dot =
 styled(
  motion.custom('div')
  )`
   border-radius: 100%;
 `;

const Dash =
 styled(
  motion.custom('div')
  )``;

const Space = styled.div<{mult: number}>`
  width: ${({ mult }) => mult * (base + 2)}px
`;

// create web audio api context
const audioCtx = new(window.AudioContext)();

const sleep = (ms: number) => 
  new Promise(resolve => setTimeout(resolve,ms));

function playNote(frequency: number, duration: number, cb: () => void) {
  // create Oscillator node
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.connect(audioCtx.destination);
  return async () => {
    oscillator.start();
    await sleep(duration);
    oscillator.stop();
    cb();
  }
}

const seq = ([p, ...promises]: (() => Promise<void>)[]): Promise<void> => {
  return Array.isArray(promises) && promises.length !== 0
    ? p().then(() => seq(promises))
    : p().then()
}

const App: React.FC = () => {
  const [text, setText] = React.useState('');
  const [speed, setSpeed] = React.useState(100);
  const [pitch, setPitch] = React.useState(150);
  const [morse, setMorse] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const [hasSound, setSound] = React.useState(false);

  const onFinishPlayingNote = (hasSound: boolean, gap: number) => () => {
    if (!hasSound && gap !== 3)
      return ;

    setIndex(i => i + 1);
  };

  const playNotes = (notes: {
    gap: number,
    hasSound: boolean
  }[]) => {
    const defaultGap = speed;
    const defaultFrequency = pitch;
  
    const ps = notes.map(({ gap, hasSound }) => {
      return playNote(
        hasSound ? defaultFrequency : 0, defaultGap * gap,
        onFinishPlayingNote(hasSound, gap)
      )
    });
  
    return seq(ps);
  }
  
  React.useEffect(() => {
    if (morse.length !== 0 && hasSound){
      playNotes(morseToGap(morse)).then(() => {
        setSound(false);
        setIndex(0);
      });
    }
  }, [morse, hasSound]);

  const variants = {
    initial: (charType: CharType) => {
      const i = charType === 'dot' ? 1 : 4;
      const frac = charType === 'dot' ? 1 : 2;
      return {
        height: base,
        width: i * base,
        marginRight: ((i * base * bigB / frac) - (i * base))/2,
        marginLeft: ((i * base * bigB / frac) - (i * base))/2,
        backgroundColor: 'black'
      };
    },
    highlight: (charType: CharType) => {
      const i = charType === 'dot' ? 1 : 4;
      const frac = charType === 'dot' ? 1 : 2;
      return {
        height: base * bigB,
        width: i * base * bigB / frac,
        marginRight: 0,
        marginLeft: 0,
        backgroundColor: 'red'
      };
    }
  }

  return (
    <div className="App">
      <input disabled={hasSound} value={text} onChange={e => {
        setMorse(textToMorse(e.target.value))
        setText(e.target.value)
      }} />
      <button onClick={() => {
        if (text.length === 0) {
          return alert('Digite algo');
        } 
        
        setSound(!hasSound)}}>Play</button>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24
      }}>
        {
          morse.split('').map((m, i) => 
            m === '.' 
              ? <Dot key={i} custom={'dot'} variants={variants} initial="initial" animate={!hasSound ? 'initial' : index === i ? 'highlight' : 'initial'} />
              : m === '-' 
                ? <Dash key={i} custom={'dash'} variants={variants} initial="initial" animate={!hasSound ? 'initial' : index === i ? 'highlight' : 'initial'} />
                : <Space mult={2} key={i} />
            )
        }
      </div>
      <div>
        <p>speed: {speed}</p>
        <input type="range" min={50} max={300} step={50} disabled={hasSound} value={speed} onChange={e => 
          setSpeed(Number(e.target.value))
        }/>
      </div>
      <div>
        <p>pitch: {pitch}</p>
        <input type="range" min={50} max={500} step={10} disabled={hasSound} value={pitch} onChange={e => 
          setPitch(Number(e.target.value))
        } />
      </div>
    </div>
  );
}

export default App;
