import React, { Reducer } from "react";
import { ScreenConfigurations, ScreenResolution } from "../qwantify/types";
import { get, set } from "../utils/localStorage";

type VideoState = {
    index: number,
    tracks: MediaStreamTrack[],
    streams: MediaStream[],
    configurations: ScreenResolution[],
    width: number,
    height: number,
    rate: number,
    horizontal: number,
    vertical: number,
    volume: number,
    muted: boolean,
    playing: boolean,
    playable: boolean,
}
const initialState: VideoState = {
    index: -1,
    tracks: [] as MediaStreamTrack[],
    streams: [] as MediaStream[],
    configurations: [] as ScreenResolution[],
    width: 1280,
    height: 720,
    rate: 30,
    horizontal: 16,
    vertical: 9,
    volume: get<number>('volume', 100),
    muted: get<boolean>('muted', false),
    playing: false,
    playable: false,
};


const setRes = (height: number, width: number) => {
    if ((height == 0 && width == 0) || (height == 0 && width != 0) || (height != 0 && width == 0)) {
        return
    }

    if (height == width) {
        return {
            horizontal: 1,
            vertical: 1,
        }
    }

    let dividend = width
    let divisor = height
    let gcd = -1

    if (height > width) {
        dividend = height
        divisor = width
    }

    while (gcd == -1) {
        const remainder = dividend % divisor
        if (remainder == 0) {
            gcd = divisor
        } else {
            dividend = divisor
            divisor = remainder
        }
    }
    return {
        horizontal: width / gcd,
        vertical: height / gcd
    }
};

const setConfigs = (configurations: ScreenConfigurations) => {
    const data: ScreenResolution[] = []

    for (const i of Object.keys(configurations)) {
        const { width, height, rates } = configurations[i]
        if (width >= 600 && height >= 300) {
            for (const j of Object.keys(rates)) {
                const rate = rates[j]
                if (rate === 30 || rate === 60) {
                    data.push({
                        width,
                        height,
                        rate,
                    })
                }
            }
        }
    }
    return data.sort((a, b) => {
        if (b.width === a.width && b.height == a.height) {
            return b.rate - a.rate
        } else if (b.width === a.width) {
            return b.height - a.height
        }
        return b.width - a.width
    })
}

type ActionType = {
    type: 'PLAY' | 'PAUSE' | 'TOGGLEPLAY' | 'SETMUTED' | 'TOGGLEMUTE' |
    'SETPLAYABLE' | 'SETRESOLUTION' | 'SETCONFIGURATIONS' | 'SETVOLUME' | 'SETSTREAM'
    | 'ADDTRACK' | 'DELTRACK' | 'RESET';
    payload: any//boolean | number | { width: number; height: number; res: number } | [MediaStreamTrack, MediaStream] | undefined
}

export const VideoReducer = (state: VideoState, action: ActionType):VideoState => {
    const { type, payload } = action;
    //TODO: better state handling with dedicated functions 
    switch (type) {
        case 'PLAY':
            return {
                ...state,
                playing: state.playable ? true : false
            }
        case 'PAUSE':
            return {
                ...state,
                playing: state.playable ? false : true
            }
        case "TOGGLEPLAY":
            return {
                ...state,
                playing: !state.playing
            }
        case 'SETMUTED':

            set('mute', state.muted);

            return {
                ...state,
                muted: state.muted
            }
        case 'TOGGLEMUTE':
            set('mute', !state.muted);
            return {
                ...state,
                muted: !state.muted
            }
        case 'SETPLAYABLE':
            const playable: boolean = payload;
            return {
                ...state,
                playable: !playable && state.playing ? false : playable
            }
        case 'SETRESOLUTION':
            const { width, height, rate } = payload;
            const gcd = setRes(width, height);
            return {
                ...state,
                ...gcd,
                width,
                height,
                rate,
            }
        case 'SETCONFIGURATIONS':
            const configurations: ScreenConfigurations = payload;
            const data = setConfigs(configurations);

            return {
                ...state,
                configurations: data
            }
        case 'SETVOLUME':
            const volume: number = payload;
            set('volume', volume);
            return {
                ...state,
                volume
            }
        case 'SETSTREAM':
            const index: number = payload;
            return {
                ...state,
                index
            }
        case 'ADDTRACK':
            const [track, stream]: [MediaStreamTrack, MediaStream] = payload;
            return {
                ...state,
                tracks: state.tracks.concat([track]),
                streams: state.streams.concat([stream])
            }
        case 'DELTRACK':
            const id: number = payload;
            return {
                ...state,
                streams: state.streams.filter((_: any, i: number) => i !== id),
                tracks: state.tracks.filter((_: any, i: number) => i !== id)
            }

        case 'RESET':
            return {
                ...state,
                index: -1,
                tracks: [],
                streams: [],
                configurations: [],
                width: 1280,
                height: 720,
                rate: 30,
                horizontal: 16,
                vertical: 9,
                playing: false,
                playable: false,
            }
        default:
            return state;
    }
};

type VideoProps = {
    children: React.ReactElement;
}

export const VideoContext = React.createContext({
    dispatch: (type: ActionType["type"], payload?: any) => { },
    state: initialState
});

export default function VideoProvider({ children }: VideoProps) {
    const [state, dispatch] = React.useReducer<Reducer<VideoState, ActionType>>(VideoReducer, initialState);

    const videoDispatch = (type: ActionType["type"], payload?: any) => {
        //TODO: Reafactor some of this(?)
        dispatch({
            type,
            payload
        })
    }

    return (
        <VideoContext.Provider value={{ state, dispatch: videoDispatch }}>
            {children}
        </VideoContext.Provider>
    )
}

