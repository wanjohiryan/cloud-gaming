import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Chat from "../components/chat";
import Header from "../components/header";
import Main from "../components/main/main";
import Users from "../components/users";

export default function Home() {
  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      overflowX: "hidden",
      overflowY: "hidden",
      backgroundColor: "#000",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      flexDirection:"column"
    }}>
      {/* header with logo */}
      <Header />
      {/* main body */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flexDirection: "row",
        height:"90%"
      }} >
        {/* users tab */}
        <Users />
        {/* main component with video */}
        <Main />
        {/* chat tab */}
        <Chat />
      </div>
    </div>
  )
};