// prettier-ignore
import Const from './constants';
import { getChunk, getMetaData } from './utils/web3';
import { setInitialViewPos } from './display/view';
import { buildMonolith, increaseMonolithHeight } from './monolith/monolith';
import { parseAPNG } from './utils/imageManager';
import { intro, launchIntro } from './intro';
import { hammer } from 'hammerjs';

export let importedChunks = 0;

export let runeNumber;
export let Opensea;
export let firstTime = false;

export const windowHeight = window.innerHeight;
export const windowWidth = window.innerWidth;
export let renderWidth = Const.COLUMNS;
export const pixelSize = windowWidth / renderWidth;
export let renderHeight = Math.ceil((windowHeight * renderWidth) / windowWidth);

async function initApp() {
    setRoute();
    firstTime = true; // To test
    if (firstTime && !Opensea) {
        console.log('parsing first APNGs before intro...');
        await parseAPNG();
        console.log('parsing done, launching intro');
        launchIntro();
    } else {
        parseAPNG();
        await chunkImport(true);
        buildMonolith();
        await setInitialViewPos();
        initDisplay();
        // lazyParseAPNG();
    }
}

initApp();

setInterval(() => {
    chunkImport(false);
}, 30000);

function setRoute() {
    if (!document.cookie.includes('visited=true')) {
        console.log('First time visiting');
        const d = new Date();
        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toUTCString();
        document.cookie = 'visited=true;' + ';' + expires + ';path=/';
        firstTime = true;
    }
    runeNumber = parseInt(document.URL.split('rune=')[1]);
    Opensea = document.URL.split('OS=')[1];
}

export async function chunkImport(firstTime) {
    let meta = await getMetaData();
    // console.log(meta);
    if (importedChunks !== meta.nbChunks || importedChunks == 1) {
        for (let i = importedChunks + 1; i <= meta.nbChunks; i++) {
            getChunk(i).then((res) => {
                // console.log(res);
                bufferOnMonolith({
                    buffer: res[4],
                    x: res[0].toNumber() % Const.MONOLITH_COLUMNS,
                    y: Math.floor(res[0].toNumber() / Const.MONOLITH_COLUMNS),
                    paid: res[3].toNumber(),
                    yMaxLegal: res[2].toNumber() / 1000000,
                    zIndex: i,
                });
            });
        }
    }
    const newMonolithHeight = Math.floor(192 + (meta.nbKlon * meta.threshold) / (1000000 * Const.COLUMNS));
    if (importedChunks - meta.nbChunks !== 0 && !firstTime)
        increaseMonolithHeight(newMonolithHeight - Const.MONOLITH_LINES);
    importedChunks = meta.nbChunks;
}

export async function setMonoHeight() {
    let meta = await getMetaData();
    // console.log(meta);
    const monolithHeight = Math.floor(192 + (meta.nbKlon * meta.threshold) / (1000000 * Const.COLUMNS));
    Const.setMonolithHeight(monolithHeight);
}
