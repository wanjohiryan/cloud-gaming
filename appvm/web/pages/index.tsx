import React, { useState, useEffect } from "react"
import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import { decodeBase64, encodeBase64, getDevice } from "../components/utils";
import { addIceCandidate, addRemoteSdp } from "../components/services/webrtc";
import AppPlayer from "../components/AppPlayer";

const ws_endpont = process.env.NEXT_PUBLIC_WS_ENDPOINT;
const selectedApp = "3jeododi";

export default function Home() {
  const [welcoming, setWelcoming] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [inpChannel, setInpChannel] = useState<null | RTCDataChannel>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const ws = new WebSocket(ws_endpont);

    console.log("ws log", ws)

    ws.onopen = () => {
      setWs(ws);

      console.log("ws opened", ws)

    };

    ws.onerror = () => {
      throw Error("Failed to connect to the server");
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (pc !== null && ws !== null) {
      const msg = {//this will be removed
        type: "start",
        data: JSON.stringify({
          appID: selectedApp,
          device: getDevice(),
        }),
      };
      ws.send(JSON.stringify(msg));

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "sdp") {
          const offer = JSON.parse(decodeBase64(msg.data));
          const answer = await addRemoteSdp(pc, offer);
          ws.send(
            JSON.stringify({
              type: "sdp",
              data: encodeBase64(JSON.stringify(answer)),
            })
          );
        } else if (msg.type === "ice-candidate") {
          const ice = JSON.parse(decodeBase64(msg.data));
          addIceCandidate(pc, ice);
        }
      };
    };
  }, [pc, ws]);


  useEffect(() => {
    if (inpChannel === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (inpChannel.readyState !== "open") return;

      inpChannel.send(
        JSON.stringify({
          type: "KEYDOWN",
          data: JSON.stringify({
            keyCode: event.keyCode,
          }),
        })
      );
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (inpChannel.readyState !== "open") return;

      inpChannel.send(
        JSON.stringify({
          type: "KEYUP",
          data: JSON.stringify({
            keyCode: event.keyCode,
          }),
        })
      );
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [inpChannel]);

  const startApp = async (appId: string) => {
    console.log("Start playing", appId);

    const newPc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    newPc.ondatachannel = (event) => {
      const channel = event.channel;
      if (channel.label === "app-input") {
        channel.onopen = () => {
          console.log("got input datachannel");
          setInpChannel(channel);
        };
      } else if (channel.label === "health-check") {
        let healthCheckIntId: NodeJS.Timer;

        channel.onopen = () => {
          console.log("got health-check datachannel");
          healthCheckIntId = setInterval(() => {
            //@ts-expect-error
            channel.send({});
          }, 2000);
        };

        channel.onclose = () => {
          clearInterval(healthCheckIntId);
        };
      }
    }

    newPc.ontrack = (event) => {
      console.log("got track", event);
      if (event.streams && event.streams[0]) {
        setVideoStream(event.streams[0]);
      } else {
        let inboundStream = null;
        if (!videoStream) {
          inboundStream = new MediaStream();
          inboundStream.addTrack(event.track);
        } else {
          inboundStream = { ...videoStream };
          inboundStream.addTrack(event.track);
        }
        setVideoStream(inboundStream);
      }
    };

    newPc.onicecandidate = (event) => {
      const iceCandidate = event.candidate;

      if (iceCandidate && ws) {
        ws.send(
          JSON.stringify({
            type: "ice-candidate",
            data: encodeBase64(JSON.stringify(iceCandidate)),
          })
        );
      }
    };

    newPc.oniceconnectionstatechange = (event: any) => {
      console.log(event.target.iceConnectionState);
    };

    setPc(newPc);
  };

  const selectApp = (appId: string) => {
    // setSelectedApp(appId);
    startApp(appId);
  };

  const closeApp = () => {
    if (pc !== null) {
      pc.close();
    }

    setPc(null);
    setVideoStream(null);
    setInpChannel(null);
    // setSelectedApp("");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>qwantify</title>
        <meta name="description" content="Game at the speed of thought" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <AppPlayer
        videoStream={videoStream}
        inpChannel={inpChannel}
        onCloseApp={closeApp}
      />

    </div>
  )
}
