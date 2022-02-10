import React, { useState, useEffect } from "react";

import { decodeBase64, encodeBase64 } from "./utils";

import VideoStream from "./components/VideoStream";

import "./App.scss";

function App() {
  const [ws, setWs] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [inpChannel, setInpChannel] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_ENDPOINT);

    ws.onopen = () => {
      setWs(ws);
    };

    ws.onerror = (err) => {
      console.log("Failed", err);
    };

    return () => ws.close();
  }, []);

  useEffect(async () => {
    if (ws === null) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      if (channel.label === "app-input") {
        channel.onopen = () => {
          console.log("got input datachannel");
          setInpChannel(channel);
        };

        channel.onclose = () => {
          console.log("closed input datachannel");
          setInpChannel(null);
        };
      }
    };

    pc.ontrack = (event) => {
      console.log("got track", event);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        let inboundStream = null;
        if (!remoteStream) {
          inboundStream = new MediaStream();
          inboundStream.addTrack(event.track);
        } else {
          inboundStream = { ...remoteStream };
          inboundStream.addTrack(event.track);
        }
        setRemoteStream(inboundStream);
      }
    };

    pc.onicecandidate = (event) => {
      const iceCandidate = event.candidate;

      if (iceCandidate) {
        ws.send(
          JSON.stringify({
            type: "ice-candidate",
            sender: "client",
            receiver: "coordinator",
            data: encodeBase64(JSON.stringify(iceCandidate)),
          })
        );
      }
    };

    pc.oniceconnectionstatechange = (event) => {
      console.log(event.target.iceConnectionState);
    };

    const msg = {
      type: "start",
      sender: "client",
      receiver: "coordinator",
    };
    ws.send(JSON.stringify(msg));

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "sdp") {
        const offer = JSON.parse(decodeBase64(msg.data));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        ws.send(
          JSON.stringify({
            type: "sdp",
            sender: "client",
            receiver: "coordinator",
            data: encodeBase64(JSON.stringify(answer)),
          })
        );
        await pc.setLocalDescription(answer);
      } else if (msg.type === "ice-candidate") {
        const ice = JSON.parse(decodeBase64(msg.data));
        pc.addIceCandidate(new RTCIceCandidate(ice));
      }
    };

    return () => pc.close();
  }, [ws]);

  return (
    <div className="App">
      <VideoStream
        src={remoteStream}
        height="600px"
        width="800px"
        inpChannel={inpChannel}
      />
    </div>
  );
}

export default App;
