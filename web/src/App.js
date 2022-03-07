import React, { useState, useEffect } from "react";

import { decodeBase64, encodeBase64 } from "./utils";

import VideoStream from "./components/VideoStream";

import "./App.scss";

function App() {
  const [ws, setWs] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [inpChannel, setInpChannel] = useState(null);
  const [start, setStart] = useState(false);

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
    if (!start) return;

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
      } else if (channel.label === "health-check") {
        channel.onopen = () => {
          console.log("got health-check datachannel");
          setInterval(() => {
            channel.send({});
          }, 2000);
        };
      }
    };

    pc.ontrack = (event) => {
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

    pc.onicecandidate = (event) => {
      const iceCandidate = event.candidate;

      if (iceCandidate) {
        ws.send(
          JSON.stringify({
            type: "ice-candidate",
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
      data: JSON.stringify({
        appName: "spider_pc",
      }),
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
        try {
          pc.addIceCandidate(new RTCIceCandidate(ice));
        } catch (e) {
          console.log(e);
        }
      }
    };

    return () => pc.close();
  }, [start]);

  useEffect(() => {
    if (inpChannel === null) return;

    document.addEventListener("keydown", (event) => {
      if (!inpChannel) return;

      inpChannel.send(
        JSON.stringify({
          type: "KEYDOWN",
          data: JSON.stringify({
            keyCode: event.keyCode,
          }),
        })
      );
    });

    document.addEventListener("keyup", (event) => {
      if (!inpChannel) return;

      inpChannel.send(
        JSON.stringify({
          type: "KEYUP",
          data: JSON.stringify({
            keyCode: event.keyCode,
          }),
        })
      );
    });
  }, [inpChannel]);

  const onStartButtonClick = () => {
    setStart(true);
  };

  return (
    <div className="App">
      <button onClick={onStartButtonClick}>Cloud Gaming</button>
      <VideoStream
        src={videoStream}
        height="600px"
        width="800px"
        inpChannel={inpChannel}
      />
    </div>
  );
}

export default App;
