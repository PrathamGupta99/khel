// pages/_app.js
import React from "react";
import { AuthProvider } from "../contexts/AuthContext.js";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
