import { monolith } from './monolith';
import { GUI } from './GUI';
import { landscapeBase64 } from '../assets/data';
import Const from './constants';
import { renderWidth, renderHeight, viewPosX, viewPosY } from '../main';

var previousViewPosY;
var previousViewPosX;
var previousLandscape;

export function assemble() {
    const monolithStartY = Const.MONOLITH_LINES + Const.MARGIN_BOTTOM - viewPosY - renderHeight;
    const monolithStartX = viewPosX - Const.MARGIN_LEFT;
    // console.log('monolithStartY', monolithStartY);
    // console.log('monolithStartX', monolithStartX);
    let startAssemble = performance.now();
    let displayArray = [];

    let layersToDisplay = [];
    //PUSH GUI AND MONOLITH TO LAYERSTODISPLAY ARRAY
    layersToDisplay.push({
        name: 'GUI',
        colorsArray: GUI.decodedYX,
        startY: Math.floor((renderHeight - GUI.height) / -1.05),
        startX: (renderWidth - GUI.width) / -2,
    });
    layersToDisplay.push({
        name: 'monolith',
        colorsArray: monolith,
        startY: monolithStartY,
        startX: monolithStartX,
    });

    //IF THE VIEWPOS HAS CHANGED, PUSH THE NEW LAYERS TO LAYER ARRAY
    if (previousViewPosY !== viewPosY || previousViewPosX !== viewPosX) {
        //FOR EACH LAYER, IF CONDITIONS ARE MET, PUSH TO LAYERTODISPLAY
        for (let layer in landscapeBase64) {
            const thisLayer = landscapeBase64[layer];

            let parallaxOffset = Math.floor(thisLayer.parallax * viewPosY);

            if (thisLayer.startY - thisLayer.height - parallaxOffset > viewPosY + renderHeight) continue; // If the layer above render, skip it
            if (Const.LINES - thisLayer.startY + parallaxOffset > Const.LINES - viewPosY) continue; // If the layer under render, skip it

            // let offset = (Const.LINES - thisLayer.startY + parallaxOffset) * Const.COLUMNS;

            const startY = thisLayer.startY - parallaxOffset - viewPosY - renderHeight;
            const startX = thisLayer.startX;

            layersToDisplay.push({
                name: thisLayer.name,
                colorsArray: thisLayer.decodedYX,
                startY: startY,
                startX: startX,
            });
        }
        previousViewPosY = viewPosY;
        previousViewPosX = viewPosX;
    } else {
        displayArray = previousLandscape;
    }

    for (let y = 0; y < renderHeight; y++) {
        for (let x = 0; x < renderWidth; x++) {
            for (let z = 0; z < layersToDisplay.length; z++) {
                const layer = layersToDisplay[z];
                const array = layer.colorsArray;
                const startY = layer.startY;
                const startX = layer.startX;

                const pixel = array[startY + y]?.[startX + x];
                if (!pixel) continue;

                displayArray[y * renderWidth + x] = pixel.color ? pixel.color : pixel;
                break;
            }
            //IF NO COLOR HAS BEEN PUSHED, PUSH THE DEFAULT COLOR
            if (!displayArray[y * renderWidth + x]) {
                displayArray[y * renderWidth + x] = Const.SKY_COLOR;
            }
        }
    }

    previousLandscape = displayArray;
    // console.log('displayArray', displayArray, 'previousLandscape', previousLandscape);
    console.log('Assemble = ', Math.floor(performance.now() - startAssemble), 'ms');
    return displayArray;
}
