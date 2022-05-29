import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import contractABI from '../utils/abi.json';
import { displayShareScreen } from '../display/GUI';
import { chunkImport } from '../main';
import { decreaseZoom } from '../display/view';

const provider = new ethers.providers.InfuraProvider("mainnet");
const iface = new Interface(contractABI);
const contractAddress = '0xC3891fc8375901F78fCc2743922B237C960C3147';
const contract = new ethers.Contract(contractAddress, contractABI, provider);
let metamaskProvider;
var metamaskContract;

let sentChunk;

if (window.ethereum) {
    metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    metamaskContract = new ethers.Contract(contractAddress, contractABI, signer);
}

export const chunkCreator = async (res) => {
    await metamaskProvider.send('eth_requestAccounts', []);
    let p = await getPrice();
    let overrides = {
        value: p.mul(res.nbPix),
    };
    // console.log('Minting: ', res.position, res.ymax, res.nbPix, res.imgURI);
    let tx = metamaskContract.draw2438054C(res.position, res.ymax, res.nbPix, res.imgURI, overrides);
    tx.then((tx) => {
        tx.wait().then(() => {
            chunkImport(false);
            getMetaData().then((meta) => {
                sentChunk = meta.nbChunks;
                setTimeout(() => {
                    displayShareScreen();
                    decreaseZoom(1);
                }, 3000);
            });
        });
    });
};

/**
 * Demande les données d'un chunk
 * @param {numero du dessin} id
 * @returns {position, ymax, nbPix, string de l'image}
 */
export const getChunk = async (id) => {
    let data = await contract.queryFilter(contract.filters.Chunk(id));
    let topics = data[0].topics;
    data = data[0].data;
    let res = iface.parseLog({ data, topics }).args;
    res = res.slice(1);
    return res;
};

export const getAllChunks = async () => {
    let data = await contract.queryFilter(contract.filters.Chunk());
    let allChunks = [];
    data.forEach(d => {
        let data = d.data;
        let topics = d.topics;
        let chunk = iface.parseLog({ data, topics }).args;
        allChunks.push(chunk);
    });
    console.log(allChunks);
    return allChunks;
};

export const getChunksFromPosition = async (min, max) => {
    let res = [];
    for (let i = min; i <= max; i++) {
        let data = await contract.queryFilter(contract.filters.Chunk(null, i));
        if (data.length > 0) {
            let topics = data[0].topics;
            data = data[0].data;
            let chunk = iface.parseLog({ data, topics }).args;
            chunk = chunk.slice(1);
            res.push(chunk);
        }
    }
    return res;
};

async function getPrice() {
    let price = await contract._pricePerPix();
    return price;
}

export async function getMetaData() {
    let metadata = await contract.getMonolithInfo();
    return { nbKlon: metadata[2].toNumber(), threshold: metadata[1].toNumber(), nbChunks: metadata[0].toNumber() };
}

export function openLink(type) {
    if (type === 'opensea') {
        window.open('https://testnets.opensea.io/assets/' + contractAddress + '/' + sentChunk, '_blank');
    } else if (type === 'twitter') {
        window.open(
            'https://twitter.com/intent/tweet?text=My%20mark%20on%20the%20moonolith%20%3A&url=moonolith.io/?mark=' +
                sentChunk,
            '_blank'
        );
    }
}

export function getBrowserLocales(options = {}) {
    const defaultOptions = {
        languageCodeOnly: false,
    };
    const opt = {
        ...defaultOptions,
        ...options,
    };
    const browserLocales = navigator.languages === undefined ? [navigator.language] : navigator.languages;
    if (!browserLocales) {
        return undefined;
    }
    return browserLocales.map((locale) => {
        const trimmedLocale = locale.trim();
        return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale;
    });
}

export function isMetamaskHere() {
    if (window.ethereum) return true;
    else return false;
}
