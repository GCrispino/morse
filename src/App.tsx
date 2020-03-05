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
  const [index, setIndex] = React.useState(0);
  const [hasSound, setSound] = React.useState(false);

  React.useEffect(() => {
    console.log(new Date(), index)
  }, [index])

  const onFinishPlayingNote = (hasSound: boolean) => () => {
    console.log('a')
    if (!hasSound)
      return ;
    console.log(' b')
    // console.log('acabou', new Date(), index)
      
    const newIndex = index === morse.length - 1 ? 0 : index + 1
    // console.log('acabou2', new Date(), newIndex)

    setIndex(newIndex);
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
        //  onFinishPlayingNote(hasSound)
        () => {
          console.log({index})
          setIndex(index + 1);
          // console.log('a')
          // if (!hasSound)
          //   return ;
          // console.log(' b')
          // // console.log('acabou', new Date(), index)
          //   console.log({index})
          // const newIndex = index === morse.length - 1 ? 0 : index + 1
          // // console.log('acabou2', new Date(), newIndex)
          // console.log({newIndex})
          // setIndex(newIndex);
        });
    });
  
    return seq(ps);
  }
  // }, [speed, pitch, onFinishPlayingNote, index]);

  React.useEffect(() => {
    if (morse.length !== 0 && hasSound){
      playNotes(morseToGap(morse)).then(() => setSound(false));
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
        {morse.split('').map((m, i) => <span style={{
          color: index === i ? 'red' : 'black'
        }} >{m}</span>)}
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
