import socketIOClient from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

const newWSConnection = () => {
  return socketIOClient(ENDPOINT);
};

export { newWSConnection };
