import Const from '../constants';
import { monolith, monolithIndexes } from './monolith';
import { runeCorner, runeSide } from '../assets/base64';
import { renderHeight } from '../main';
import { viewPosY } from '../display/view';

export let chunkStock = [];
export let chunksToAnimateInfo = [];

export let runeCornerInfo = { base64: runeCorner };
export let runeSideInfo = { base64: runeSide };

export let animatedPixels = new Map();

//prettier-ignore
export function animateMonolith() {
    // Trigger animateRune for visible chunks
    chunksToAnimateInfo.forEach(([id, y]) => {
        const startY = Const.MONOLITH_LINES + Const.MARGIN_BOTTOM - viewPosY - renderHeight;
        if (y > startY && y < startY + renderHeight) animateRune(id);
    });

    for (let [pos, [transitionType, color, counter]] of animatedPixels) {
        if (transitionType === 'erase') {

            if (counter === 1) draw(pos, [0, 118, 255]);
            else draw(pos, avg(color, pos, 8));
            if (counter === 10) {endTransition(pos, color);continue;}

        } else if (transitionType === 'draw') {

            if (counter === 1) draw(pos, [254, 1, 255]);
            else if (counter === 2) draw(pos, [255, 116, 139]);
            else if (counter === 3) draw(pos, [255, 246, 10]);
            else if (counter === 4) draw(pos, [158, 255, 97]);
            else if (counter === 5) draw(pos, [16, 255, 239]);
            else if (counter === 6) draw(pos, [108, 147, 255]);
            else draw(pos, avg(color, pos, 1))
            if (counter === 10) {endTransition(pos, color);continue;}

        } else if (transitionType === 'import') {

            if (counter === 1) draw(pos, Const.DEFAULT_COLOR);
            else if (counter === 3) draw(pos, Const.DEFAULT_COLOR);
            else if (counter === 5) draw(pos, [88, 141, 190]);
            else if (counter === 8) draw(pos, [132, 172, 228]);
            else if (counter === 11) draw(pos, [166, 252, 219]);
            else if (counter === 14) draw(pos, [88, 141, 190]);
            else if (counter === 15) draw(pos, [166, 252, 219]);
            else if (counter === 18) draw(pos, [132, 172, 228]);
            else if (counter === 21) draw(pos, [88, 141, 190]);
            else if (counter > 21) draw(pos, avg(color, pos, 5));
            if (counter === 34) {endTransition(pos, color);continue;}

        } else if (transitionType === 'whiteOnRune') {

            if (counter === 96) draw(pos, [255, 255, 255]);
            if (counter === 100) {endTransition(pos, color);continue;}

        } else if (transitionType === 'runeBlueAnim') {

            if (counter === 1) draw(pos, [32, 214, 199]);
            else if (counter < 10) draw(pos, [32, 214, 199]);
            else draw(pos, avg(color, pos, 10));
            if (counter === 50) {endTransition(pos, color);continue;}

        } else if (transitionType === 'runeContour') {

            if (counter === 1) draw(pos, [32, 214, 199]);
            else if (counter < 15) draw(pos, [32, 214, 199]);
            else draw(pos, avg(color, pos, 10));
            if (counter === 50) {endTransition(pos, color);continue;}

        } else if (transitionType === 'runeCornerOrSide0') {

            if (counter === 1) draw(pos, [105, 193, 177]);
            else if (counter < 10) draw(pos, [105, 193, 177]);
            else draw(pos, avg(color, pos, 10));
            if (counter === 50) {endTransition(pos, color);continue;}

        } else if (transitionType === 'runeCornerOrSide1') {

            if (counter === 1) draw(pos, [38, 93, 89]);
            else if (counter < 10) draw(pos, [38, 93, 89]);
            else draw(pos, avg(color, pos, 10));
            if (counter === 50) {endTransition(pos, color);continue;}

        }
        animatedPixels.set(pos, [transitionType, color, animatedPixels.get(pos)[2] + 1])
    }
}

function draw(pos, color) {
    monolith[pos] = color[0];
    monolith[pos + 1] = color[1];
    monolith[pos + 2] = color[2];
}

function endTransition(pos, color) {
    draw(pos, color);
    animatedPixels.delete(pos);
}

function avg(color1, pos, weightOf2 = 1) {
    return [
        (color1[0] + monolith[pos] * weightOf2) / (1 + weightOf2),
        (color1[1] + monolith[pos + 1] * weightOf2) / (1 + weightOf2),
        (color1[2] + monolith[pos + 2] * weightOf2) / (1 + weightOf2),
    ];
}

export function animateRune(id) {
    //Triggered only once per rune
    if (!chunkStock[id] || chunkStock[id]?.alreadyRuned) return;
    chunkStock[id].alreadyRuned = true;
    const rune = chunkStock[id];
    // console.log('animateRune', id);

    setTimeout(() => {
        const limit = rune.width + Math.max(rune.width, rune.height);
        for (let j = 0; j < rune.height; j++) {
            for (let i = 0; i < rune.width; i++) {
                const y = j + rune.y;
                const x = i + rune.x;
                const pos = (y * Const.MONOLITH_COLUMNS + x) * 4;
                if (x < 0 || x >= Const.MONOLITH_COLUMNS || y < 0 || y >= Const.MONOLITH_LINES) continue;
                if (!monolithIndexes[y]?.[x]) continue;
                if (animatedPixels.get(pos)) continue;
                const color = [monolith[pos], monolith[pos + 1], monolith[pos + 2]];
                if (j + i < limit / 5) animatedPixels.set(pos, ['whiteOnRune', color, 90]);
                else if (j + i < limit / 4) animatedPixels.set(pos, ['whiteOnRune', color, 88]);
                else if (j + i < limit / 3) animatedPixels.set(pos, ['whiteOnRune', color, 86]);
                else if (j + i < limit / 2) animatedPixels.set(pos, ['whiteOnRune', color, 84]);
                else if (j + i < limit / 1.5) animatedPixels.set(pos, ['whiteOnRune', color, 82]);
                else if (j + i < limit / 1) animatedPixels.set(pos, ['whiteOnRune', color, 80]);
            }
        }
    }, 1600);

    // runeCorners
    // prettier-ignore
    // const order = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    // for (let a = 0; a < 4; a++) {
    //     const direction = order[a];
    //     const startY = direction[0] === -1 ? rune.y : rune.y + rune.height;
    //     const startX = direction[1] === -1 ? rune.x : rune.x + rune.width;
    //     for (let j = 0; j < runeCornerInfo.decoded.height; j++) {
    //         for (let i = 0; i < runeCornerInfo.decoded.width; i++) {
    //             const posInPng = (j * runeCornerInfo.decoded.width + i) * 4;
    //             if (!runeCornerInfo.decoded.decodedYX[posInPng + 3]) continue;
    //             const blue = runeCornerInfo.decoded.decodedYX[posInPng] === 38 ? 1 : 0;
    //             const y = startY + (j - 12) * direction[0]; //25
    //             const x = startX + (i - 6) * direction[1]; //12
    //             animThisPixel(y, x, 'runeCornerOrSide' + blue);
    //         }
    //     }
    // }

    //runeSide
    // for (let j = 0; j < runeSideInfo.decoded.height; j++) {
    //     for (let i = 0; i < runeSideInfo.decoded.width; i++) {
    //         const posInPng = (j * runeSideInfo.decoded.width + i) * 4;
    //         if (!runeSideInfo.decoded.decodedYX[posInPng + 3]) continue;
    //         const blue = runeSideInfo.decoded.decodedYX[posInPng] === 38 ? 1 : 0;
    //         console.log('rune.y', rune.y, 'rune.x', rune.x, 'rune.height', rune.height, 'rune.width', rune.width);
    //         const y = rune.y + Math.floor(rune.height / 2) + j - 6;
    //         const x = rune.x + rune.width + i + 6; //5
    //         animThisPixel(y, x, 'runeCornerOrSide' + blue);
    //     }
    // }

    // runeContour
    for (let j = rune.y; j < rune.height + rune.y; j++) {
        for (let i = rune.x; i < rune.width + rune.x; i++) {
            if (i < 0 || i >= Const.MONOLITH_COLUMNS || j < 0 || j >= Const.MONOLITH_LINES) continue;
            if (!monolithIndexes[j]?.[i]) continue;
            // i et j sont les coordonnées du pixel à dessiner
            for (let b = -1; b <= 1; b++) {
                for (let a = -1; a <= 1; a++) {
                    if (a === 0 && b === 0) continue;
                    const y = b + j;
                    const x = a + i;
                    animThisPixel(y, x, 'runeContour');
                }
            }
        }
    }

    function animThisPixel(y, x, animName) {
        if (x < 0 || x >= Const.MONOLITH_COLUMNS || y < 0 || y >= Const.MONOLITH_LINES) return;
        if (monolithIndexes[y]?.[x]) return;
        const pos = (y * Const.MONOLITH_COLUMNS + x) * 4;
        // Does nothing if an animation is already running on this pixel
        if (animatedPixels.get(pos)) return;
        const color = [monolith[pos], monolith[pos + 1], monolith[pos + 2]];
        animatedPixels.set(pos, [animName, color, 1]);
    }
}
