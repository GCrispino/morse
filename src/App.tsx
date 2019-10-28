import React from 'react';
import './App.css';
import {textToMorse, morseToGap} from './Utils/textToMorse';

// create web audio api context
var audioCtx = new(window.AudioContext)();

const sleep = (ms: number) => 
  new Promise(resolve => setTimeout(resolve,ms));

function playNote(frequency: number, duration: number) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();
  
  oscillator.type = 'square';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.connect(audioCtx.destination);
  return async () => {
    oscillator.start();
    await sleep(duration);
  oscillator.stop();
}
}

const seq = ([p, ...promises]: (() => Promise<void>)[]): Promise<void> => {
  return Array.isArray(promises) && promises.length !== 0
    ? p().then(() => seq(promises))
    : p().then()
}

const playNotes = (notes: {
  gap: number,
  hasSound: boolean
}[]) => {
  const defaultGap = 100;
  const defaultFrequency = 150;

  const ps = notes.map(({ gap, hasSound }) => {
    return playNote(
      hasSound ? defaultFrequency : 0, defaultGap * gap);
  });

  return seq(ps);
}

const App: React.FC = () => {
  const [text, setText] = React.useState('')
  const [morse, setMorse] = React.useState('');
  const [hasSound, setSound] = React.useState(false);

  React.useEffect(() => {
    if (morse.length !== 0 && hasSound)
      playNotes(morseToGap(morse)).then(() => setSound(false));
  }, [morse, hasSound])

  return (
    <div className="App">
      <input type="checkbox" checked={hasSound} onChange={() => setSound(!hasSound)} />
      <input value={text} onChange={(e)=> {
        setMorse(textToMorse(e.target.value))
        setText(e.target.value)
        }} />
      <p>{morse}</p>
    </div>
  );
}

export default App;
