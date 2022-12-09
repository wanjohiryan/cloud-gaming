import { useContext, useEffect, useState } from "react";
import { OPCODE } from "./data";
// import { OPCODE } from "./data";
import { EVENT, WebSocketEvents } from "./events";
import useEventFunctions from "./functions";
//TODO:: HAndle state ; video, fullscreen ,gamepad, play/pause, admin/user(autologin?),chat 
import {
    WebSocketMessages,
    WebSocketPayloads,
    SignalProvidePayload,
    SignalCandidatePayload,
    SignalOfferPayload,
    SignalAnswerMessage,
    SystemMessagePayload,
    MemberListPayload,
    MemberPayload,
    ControlPayload
} from "./messages"
import { Member } from "./types";

type connEvent = 'wheel' | 'mousemove' | 'mousedown' | 'mouseup' | 'keydown' | 'keyup';

export interface BaseEvents {
    info: (...message: any[]) => void;
    warn: (...message: any[]) => void;
    debug: (...message: any[]) => void;
    error: (error: Error) => void;
};

export default function useBaseClient() {
    const [ws, setWs] = useState<WebSocket>();
    const [url, setUrl] = useState<string>();
    const [peer, setPeer] = useState<RTCPeerConnection>();
    const [channel, setChannel] = useState<RTCDataChannel>();
    const [timer, setClearTimer] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>();
    const [id, setId] = useState<string>('');
    const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);
    const [connState, setConnState] = useState<RTCIceConnectionState>("disconnected")
    const { functions, cleanUp, notification, user, chat, remote, getMember } = useEventFunctions(id);

    useEffect(() => {
        const t = setTimeout(() => {
            onTimeout()
        }, 15000);

        if (timer) {
            clearTimeout(t)
        }

        return () => {
            clearTimeout(t)
        }
    }, [timer])


    const isBrowserSupported = () => {
        return typeof RTCPeerConnection !== 'undefined' && typeof RTCPeerConnection.prototype.addTransceiver !== 'undefined';
    };

    const isSocketOpened = () => {
        return typeof ws !== 'undefined' && ws.readyState === WebSocket.OPEN;
    };

    const isPeerConnected = () => {
        return typeof peer !== 'undefined' && ['connected', 'checking', 'completed'].includes(connState);
    };

    const isConnected = () => {
        return isPeerConnected() && isSocketOpened();
    };

    const disconnect = () => {
        if (timer) {
            setClearTimer(true);
        }

        if (ws) {
            ws.onmessage = () => { };
            ws.onerror = () => { };
            ws.onclose = () => { };

            try {
                //@ts-expect-error
                ws.onclose()
            } catch (err) {

            }

            setWs(undefined);
        }

        if (channel) {
            //reset all events
            channel.onmessage = () => { };
            channel.onerror = () => { };
            channel.onclose = () => { };

            try {
                //@ts-expect-error
                channel.onclose()
            } catch (err) { }

            setChannel(undefined)
        }

        if (peer) {
            //reset all events
            peer.onconnectionstatechange = () => { };
            peer.onsignalingstatechange = () => { };
            peer.oniceconnectionstatechange = () => { };
            peer.ontrack = () => { }

            try {
                peer.close()
            } catch (err) { }

            setPeer(undefined);
        }

        setConnState('disconnected');
        setDisplayName(undefined);
        setId('')
    }


    const onDisconnected = (reason?: Error) => {
        disconnect();
        console.debug("disconnected:", reason);
        functions[EVENT.DISCONNECTED](reason);
        return;
    };

    const onTrack = (event: RTCTrackEvent) => {
        console.debug(`recieved ${event.track.kind} track from peer: ${event.track.id}`, event);

        const stream = event.streams[0];
        if (!stream) {
            console.warn(`no stream provided for track ${event.track.id}(${event.track.label})`)
            return;
        }
        functions[EVENT.TRACK](event)
    };

    const onError = (e: Event) => {
        console.error((e as ErrorEvent).error)
    }

    const onConnected = () => {
        if (timer) {
            setClearTimer(true)
        }

        if (!isConnected()) {
            console.warn('onConnected called while being disconnected');
        }

        console.debug('connected');

        functions[EVENT.CONNECTED](id)
    };

    const createPeer = (lite: boolean, servers: RTCIceServer[]) => {
        console.debug('creating new peer');

        if (!isSocketOpened()) {
            console.warn('attempting to create peer with no websocket:', ws ? `state:${ws.readyState}` : 'no socket')
            return
        }

        if (isPeerConnected()) {
            console.warn('attempting to create peer while connected')
        }

        setPeer(new RTCPeerConnection())

        if (lite !== true) {
            setPeer(new RTCPeerConnection(
                { iceServers: servers }
            ))
        };
        // if (peer) {
        peer!.onconnectionstatechange = (event) => {
            console.debug('peer connection state changed ', peer ? peer.connectionState : undefined)
        }

        peer!.onsignalingstatechange = (e) => {
            console.debug('peer signalling state changed:', peer ? peer.signalingState : undefined)
        }

        peer!.oniceconnectionstatechange = (e) => {
            setConnState(peer!.iceConnectionState)

            console.debug(`peer ice candidate changed: ${peer!.iceConnectionState}`);

            switch (connState) {
                case 'checking':
                    if (timer) {
                        setClearTimer(true)
                    }
                    break;
                case 'connected':
                    onConnected();
                    break;
                case 'disconnected':
                    functions[EVENT.RECONNECTING]();
                    break;
                case 'failed':
                    onDisconnected(new Error('peer failed'))
                    break;
                case 'closed':
                    onDisconnected(new Error('peer closed'))
                    break;
            }
        }
        // pass in fn without fcalling it
        peer!.ontrack = onTrack;

        peer!.onnegotiationneeded = async () => {
            console.warn("negotiation needed")

            const d = await peer!.createOffer()

            peer!.setLocalDescription(d);

            ws!.send(
                JSON.stringify({
                    event: EVENT.SIGNAL_OFFER,
                    sdp: d.sdp
                })
            );

            setChannel(peer!.createDataChannel('data'))
            channel!.onerror = onError
            channel!.onmessage = onData
            channel!.onclose = () => { onDisconnected(new Error("peer data channel closed")) }
        }
    }

    const setRemoteOffer = async (sdp: string) => {
        if (!peer) {
            console.warn('attempting to set remote offer while disconnected')
            return
        }

        peer.setRemoteDescription({ type: "offer", sdp });

        for (let i = 0; 0 < candidates.length; i++) {
            peer.addIceCandidate(candidates[i])
        }

        setCandidates([]) //reset

        try {
            const d = await peer.createAnswer();
            peer.setLocalDescription(d);

            ws!.send(
                JSON.stringify({
                    event: EVENT.SIGNAL_ANSWER,
                    sdp: d.sdp,
                    displayname: displayName
                })
            )
        } catch (e) {
            console.error(e)
        }
    }

    const setRemoteAnswer = async (sdp: string) => {
        if (!peer) {
            console.warn('attempting to create remote annswer while disconnected')
            return
        }

        peer.setRemoteDescription({ type: 'answer', sdp })
    }

    const onMessage = async (e: MessageEvent) => {
        const { event, ...payload } = JSON.parse(e.data) as WebSocketMessages;

        console.debug(`recieved  websocket event ${event} ${payload ? `with payload:` : ''}`, payload);

        if (event === EVENT.SIGNAL_PROVIDE) {
            const { sdp, lite, ice, id } = payload as SignalProvidePayload
            setId(id);

            await createPeer(lite, ice);
            await setRemoteOffer(sdp);
            return;
        }

        if (event === EVENT.SIGNAL_OFFER) {
            const { sdp } = payload as SignalOfferPayload;
            await setRemoteOffer(sdp);
            return;
        }

        if (event === EVENT.SIGNAL_ANSWER) {
            const { sdp } = payload as SignalAnswerMessage;
            await setRemoteAnswer(sdp);
            return;
        }

        if (event === EVENT.SIGNAL_CANDIDATE) {
            const { data } = payload as SignalCandidatePayload;
            const candidate: RTCIceCandidate = JSON.parse(data);

            if (peer) {
                peer.addIceCandidate(candidate);
            } else {
                candidates.push(candidate);
            }
            return
        }

        //@ts-expect-error
        if (typeof functions[event] === "function") {
            //@ts-expect-error
            functions[event](payload)
        } else {
            functions[EVENT.MESSAGE](event, payload)
        }
    }

    const onData = (e: MessageEvent) => {
        functions[EVENT.DATA](e.data)
    }

    const onTimeout = () => {
        console.debug(`connection timeout`)
        if (timer) {
            setClearTimer(true)
        }
        onDisconnected(new Error('connection timeout'))
    }


    const connect = (url: string, password: string, displayName: string) => {
        if (isSocketOpened()) {
            console.warn("attempting to create websocket while connection open");
            return;
        };

        if (!isBrowserSupported()) {
            onDisconnected(new Error('browser does not support webrtc (RTCPeerConnection missing)'))
            return
        }

        setDisplayName(displayName);
        functions[EVENT.RECONNECTING]()


        try {
            setWs(new WebSocket(`${url}?password=${encodeURIComponent(password)}`))
            console.debug(`connecting to ${ws?.url}`)
            ws!.onmessage = onMessage
            ws!.onerror = (event) => onError
            ws!.onclose = (event) => {
                onDisconnected(new Error('websocket closed'))
            }

            setClearTimer(false)
        } catch (err: any) {
            onDisconnected(err)
        }
    }

    const sendData = (event: connEvent, data: any) => {
        if (!connState) {
            console.warn('attempting to send data while disconnected');
        }

        let buffer: ArrayBuffer;
        let payload: DataView;

        switch (event) {
            case 'mousemove':
                buffer = new ArrayBuffer(7);
                payload = new DataView(buffer);
                payload.setUint8(0, OPCODE.MOVE)
                payload.setUint16(1, 4, true);
                payload.setUint16(3, data.x, true);
                payload.setUint16(5, data.y, true);
                break;
            case 'wheel':
                buffer = new ArrayBuffer(7);
                payload = new DataView(buffer);
                payload.setUint8(0, OPCODE.SCROLL)
                payload.setUint16(1, 4, true);
                payload.setUint16(3, data.x, true);
                payload.setUint16(5, data.y, true);
                break;
            case 'keydown':
            case 'mousedown':
                buffer = new ArrayBuffer(11);
                payload = new DataView(buffer);
                payload.setUint8(0, OPCODE.KEY_DOWN)
                payload.setUint16(1, 8, true);
                payload.setBigUint64(3, BigInt(data.key), true);
            case 'keyup':
            case 'mouseup':
                buffer = new ArrayBuffer(11);
                payload = new DataView(buffer);
                payload.setUint8(0, OPCODE.KEY_UP)
                payload.setUint16(1, 8, true);
                payload.setBigUint64(3, BigInt(data.key), true);
            default:
                console.warn('unknown data event', event)
                break;
        }

        //@ts-ignore
        if (typeof buffer !== undefined) {
            //@ts-expect-error
            channel!.send(buffer);
        }
    }

    const sendMessage = (event: WebSocketEvents, payload?: WebSocketPayloads) => {
        if (!connState) {
            console.warn(`attempting to send message while disconnected`)
            return
        }
        console.debug(`sending event '${event}' ${payload ? `with payload: ` : ''}`, payload)
        ws!.send(JSON.stringify({ event, ...payload }))
    }

    const init = () => {
        const url =
            process.env.NODE_ENV === 'development'
                ? `ws://${location.host.split(':')[0]}:${process.env.VUE_APP_SERVER_PORT}/ws`
                : location.protocol.replace(/^http/, 'ws') + '//' + location.host + location.pathname.replace(/\/$/, '') + '/ws'

        setUrl(url);
    }

    const login = (password: string, displayname: string) => {
        //@ts-expect-error
        connect(url, password, displayname)
    }

    const logout = () => {
        disconnect()
        cleanUp()
    }

    /////////////////////////////
    // Extra Functions requiring acces to 'this' functions
    /////////////////////////////

    functions[EVENT.SYSTEM_DISCONNECT] = ({ message }: SystemMessagePayload) => {
        if (message == 'kicked') {
            logout()
            message = 'connection  kicked'
        }
        onDisconnected(new Error(message))

        notification.eventify({
            title: "connection disconnected",
            text: message,
            type: "error"
        })
    }

    functions[EVENT.MEMBER_LIST] = ({ members }: MemberListPayload) => {
        user.dispatch("SETMEMBERS", members);
        chat.newMessage({
            id: id,
            content: "connected",
            type: "event",
            created: new Date()
        })
    }

    functions[EVENT.MEMBER_CONNECTED] = (member: MemberPayload) => {
        user.dispatch('ADDMEMBER', member);

        if (member.id !== id) {
            chat.newMessage({
                id: member.id,
                content: "connected",
                type: "event",
                created: new Date()
            })
        }
    }
    //TODO: Rethink this whole control taking and giving (for gamepads)
    functions[EVENT.CONTROL_LOCKED] = ({ id:eid }: ControlPayload) => {
        remote.dispatch('SETHOST', eid)
        remote.changeKeyboard()

        const member = getMember(eid)
        if(!member){
            return;
        }

        if(id === eid){
            notification.notify({
                type:"info",
                title:`gamepad locked by ${member.id === id ? "you" : member.displayname}`,
            })
        }

        chat.newMessage({
            id:member.id,
            content:"controls taken",
            type:"event",
            created: new Date()
        })
    }

    // functions[]

    return {
        connect,
        sendData,
        sendMessage,
        createPeer,
        setRemoteOffer,
        setRemoteAnswer,
        disconnect,
        init,
        login,
        logout,
        functions
    }
}