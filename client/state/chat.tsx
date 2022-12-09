import React, { createContext, Reducer, useEffect, useReducer, useState } from "react";


interface Emote {
    type: string
}

interface Emotes {
    [id: string]: Emote
}

interface Message {
    id: string
    content: string
    created: Date
    type: 'text' | 'event'
}

interface ChatState {
    history: Message[]
    emotes: Emotes
    texts: number
}

const initialState: ChatState = {
    history: [],
    emotes: {},
    texts: 0,
}

interface ActionType {
    payload?: any;
    type: "ADDMESSAGE" | "ADDEMOTE" | "DELEMOTE" | "RESET"
}

export const ChatReducer = (state: ChatState, action: ActionType) => {
    const { type, payload } = action

    switch (type) {
        case "ADDEMOTE":
            const { id, emote }: { id: string, emote: Emote } = payload;
            return {
                ...state,
                [id]: emote
            }
        case "ADDMESSAGE":
            const message: Message = payload;

            return {
                ...state,
                texts: message.type === "text" ? state.texts++ : state.texts,
                history: state.history.concat([message])
            }
        case "DELEMOTE":
            const key: string = payload;

            const emotes = {
                ...state.emotes
            }
            delete emotes[key]

            return {
                ...state,
                emotes
            }
        case "RESET":
            return {
                ...state,
                emotes: {},
                history: [],
                texts: 0
            }
        default:
            return state;
    }
}


export const ChatContext = createContext({
    state: initialState,
    dispatch: (type: ActionType["type"], payload?: any) => { },
    newMessage: (message: Message) => {}
})

export default function ChatProvider({ children }: { children: React.ReactElement }) {
    const [state, dispatch] = useReducer<Reducer<ChatState, ActionType>>(ChatReducer, initialState);
    const [loaded, setLoaded] = useState<boolean>(false)


    useEffect(() => {
        setLoaded(true)

        return () => { setLoaded(false) }
    }, [])

    const chatDispatch = (type: ActionType["type"], payload: any) => {
        dispatch({
            type,
            payload
        })
    }

    const newMessage = (message: Message) => {
        if (loaded) {
            //you cannot cal audio while on the server
            //issue: https://github.com/vercel/next.js/discussions/17963
            new Audio('/chat.mp3').play().catch(console.error);
        }

        dispatch({
            type: "ADDMESSAGE",
            payload: message
        })
    }

    return (
        <ChatContext.Provider
            value={{
                state,
                dispatch: chatDispatch,
                newMessage
            }}>
            {children}
        </ChatContext.Provider>
    )
}
