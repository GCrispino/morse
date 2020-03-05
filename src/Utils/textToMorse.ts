const text2morseH = {
    'A': ".-",
    'B': "-...",
    'C': "-.-.",
    'D': "-..",
    'E': ".",
    'F': "..-.",
    'G': "--.",
    'H': "....",
    'I': "..",
    'J': ".---",
    'K': "-.-",
    'L': ".-..",
    'M': "--",
    'N': "-.",
    'O': "---",
    'P': ".--.",
    'Q': "--.-",
    'R': ".-.",
    'S': "...",
    'T': "-",
    'U': "..-",
    'V': "...-",
    'W': ".--",
    'X': "-..-",
    'Y': "-.--",
    'Z': "--..",
    '1': ".----",
    '2': "..---",
    '3': "...--",
    '4': "....-",
    '5': ".....",
    '6': "-....",
    '7': "--...",
    '8': "---..",
    '9': "----.",
    '0': "-----",
    '.': ".-.-.-",
    ',': "--..--",
    ':': "---...",
    '?': "..--..",
    '\'': ".----.",
    '-': "-....-",
    '/': "-..-.",
    '(': "-.--.",
    ')': "-.--.-",
    '"': ".-..-.",
    '@': ".--.-.",
    '=': "-...-",
    '&': ".-...",
    '+': ".-.-.",
    '!': "-.-.--",
    ' ': "/"
} as {
    [key:string]: string;
}

export const textToMorse = (word: string) => 
    word
        .trim()
        .replace(/\s+/g, ' ')
        .split('')
        .map(c => text2morseH[c.toUpperCase()])
        .join(' ');

// short mark, dot or "dit" (▄▄▄▄): 1
// longer mark, dash or "dah" (▄▄▄▄▄▄): 111
// intra-character gap (between the dots and dashes within a character): 0
// short gap (between letters): 000
// medium gap (between words): 000 0 000 
const marks = {
    '-': {gap: 3, hasSound: true },
    '.': {gap: 1, hasSound: true },
    ' ': {gap: 3, hasSound: false },
    '/': {gap: 1, hasSound: false },
    '*': {gap: 1, hasSound: false}
} as {
    [key:string]: {
        gap: number,
        hasSound: boolean
    };
}

export const morseToGap = (morseCode: string) => {
    return morseCode
        .split(' ')
        .map(c =>
            c
            .split('')
            .map((y, i) => i < c.length - 1 ? `${y}*` : y)
            .join('')
        )
        .join(' ')
        .split('')
        .map(char => marks[char])
}

export default textToMorse;