export const addRemoteSdp = async (pc: { setRemoteDescription: (arg0: RTCSessionDescription) => any; createAnswer: () => any; setLocalDescription: (arg0: any) => any; }, offer: RTCSessionDescriptionInit) => {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  };
  
  export const addIceCandidate = async (pc: { addIceCandidate: (arg0: RTCIceCandidate) => void; }, iceCandidate: RTCIceCandidateInit | undefined) => {
    try {
      pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
    } catch (e) {
      console.log(e);
    }
  };
  