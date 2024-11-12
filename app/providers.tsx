"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { ClerkProvider } from "@clerk/nextjs";
import { APIProvider } from "@vis.gl/react-google-maps";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
    const router = useRouter();
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

    return (
        <ClerkProvider>
            <NextUIProvider navigate={router.push}>
                <NextThemesProvider {...themeProps}>
                    <APIProvider apiKey={googleMapsApiKey} version={"alpha"}>
                        {children}
                    </APIProvider>
                </NextThemesProvider>
            </NextUIProvider>
        </ClerkProvider>
    );
}