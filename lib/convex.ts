import React from "react";
import { ConvexReactClient, ConvexAuthProvider } from "convex/react";
import * as SecureStore from "expo-secure-store";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    console.error("EXPO_PUBLIC_CONVEX_URL is not defined");
}

export const convex = new ConvexReactClient(convexUrl!, {
    unsavedChangesWarning: false,
});

const secureStorage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
};

export const ConvexClientProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ConvexAuthProvider client= { convex } storage = { secureStorage } >
            { children }
            </ConvexAuthProvider>
    );
};
