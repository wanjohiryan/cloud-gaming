import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Logo from "../logo";

const start = "#00e1fd";
const end = "#fc007a"

export default function Header() {

    const open_qwantify = () =>{
        window.open('https://qwantify.vercel.app/', '_blank');
    }

    return (
        <div
            onClick={open_qwantify}
            style={{
                height: "10%",
                borderBottom:"2px solid black",
                cursor: "pointer",
                width: "100%",
                paddingRight: 24,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                backgroundColor: "rgb(15,15,14)",
                display: "flex",
                boxShadow: "0 0 #0000, 0 0 #0000,0 15px 50px -15px rgba(0, 0, 0, 0.12)",
                justifyContent: "center",
                alignItems: "center",
            }} >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }} >
                <a href="#" >
                    <Logo height={35} width={35} />
                </a>
                <View style={[styles.top_text_container, {
                }]} >
                    <Text style={[styles.top_header_text]} >
                        qwantify <Text style={{ fontSize: 20, color: "#39ff14" }}><sup>beta</sup></Text>
                    </Text>
                </View>
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    top_text_container: {
        height: 70,
        width: "auto",
        marginHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    top_header_text: {
        fontWeight: "600",
        width: "auto",
        fontFamily: "Aileron",
        fontSize: 30,
        textAlign: 'center',
        paddingBottom: 3,
        color: "rgba(227,222,222,1)"
    }
})
