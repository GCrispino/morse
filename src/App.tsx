import React from 'react';
import './App.css';
import {textToMorse, morseToGap} from './Utils/textToMorse';

// create web audio api context
var audioCtx = new(window.AudioContext)();

const sleep = (ms: number) => 
  new Promise(resolve => setTimeout(resolve,ms));

function playNote(frequency: number, duration: number, cb: () => void) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();
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
  const index = React.useRef(0);
  const [colorIndex, setColorIndex] = React.useState(0);
  const [hasSound, setSound] = React.useState(false);

  const onFinishPlayingNote = (hasSound: boolean) => () => {
    if (!hasSound)
      return ;
      
    const newIndex = index.current === morse.length - 1 ? 0 : index.current + 1

    index.current = newIndex;
    setColorIndex(newIndex)
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
        onFinishPlayingNote(hasSound)
      )
    });
  
    return seq(ps);
  }
  
  React.useEffect(() => {
    if (morse.length !== 0 && hasSound){
      playNotes(morseToGap(morse)).then(() => {
        setSound(false)
        index.current = 0;
        setColorIndex(0)
      });
    }
  }, [morse, hasSound])

  return (
    <div className="App">
      <input disabled={hasSound} value={text} onChange={(e)=> {
        setMorse(textToMorse(e.target.value))
        setText(e.target.value)
      }} />
      <button onClick={() => setSound(!hasSound)}>Play</button>
      <p style={{fontSize: 32}}>
        {
          morse.split('').map((m, i) => {
            return <span key={i} style={{
              color: !hasSound ? 'black' : colorIndex === i ? 'red' : 'black'
            }}>
              {m}
            </span>
            })
        }
      </p>
      <div>
        <p>speed</p>
        <input type="number" disabled={hasSound} value={speed} onChange={(e)=> {
          setSpeed(Number(e.target.value))
        }} />
      </div>
      <div>
        <p>pitch</p>
        <input type="number" disabled={hasSound} value={pitch} onChange={(e)=> {
          setPitch(Number(e.target.value))
        }} />
      </div>
    </div>
  );
}

export default App;
