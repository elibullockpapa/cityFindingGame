// components/3DMap/map-3d.tsx
"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import React, {
    ForwardedRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";

import { useCallbackRef, useDeepCompareEffect } from "./map-utility-hooks";
import { useMap3DCameraEvents } from "./use-map-3d-camera-events";

import "./map-3d-types";

export type Map3DProps = google.maps.maps3d.Map3DElementOptions & {
    onCameraChange?: (cameraProps: Map3DCameraProps) => void;
    onClick: (position: google.maps.LatLngAltitude) => void;
    children?: React.ReactNode;
};

export type Map3DCameraProps = {
    center: google.maps.LatLngAltitudeLiteral;
    range: number;
    heading: number;
    tilt: number;
    roll: number;
};

export const Map3D = forwardRef(
    (
        props: Map3DProps,
        forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>,
    ) => {
        useMapsLibrary("maps3d");

        const [map3DElement, map3dRef] =
            useCallbackRef<google.maps.maps3d.Map3DElement>();

        useMap3DCameraEvents(map3DElement, (p) => {
            if (!props.onCameraChange) return;

            props.onCameraChange(p);
        });

        const [customElementsReady, setCustomElementsReady] = useState(false);

        useEffect(() => {
            customElements.whenDefined("gmp-map-3d").then(() => {
                setCustomElementsReady(true);
            });
        }, []);

        const {
            center,
            // heading,
            // tilt,
            // range,
            // roll,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            children, // needed even though unused, not exactly sure why
            ...map3dOptions
        } = props;

        useDeepCompareEffect(() => {
            if (!map3DElement) return;

            // copy all values from map3dOptions to the map3D element itself
            Object.assign(map3DElement, map3dOptions);
        }, [map3DElement, map3dOptions]);

        useImperativeHandle<
            google.maps.maps3d.Map3DElement | null,
            google.maps.maps3d.Map3DElement | null
        >(forwardedRef, () => map3DElement, [map3DElement]);

        const centerString = useMemo(() => {
            const lat = center?.lat ?? 0.0;
            const lng = center?.lng ?? 0.0;
            const altitude = center?.altitude ?? 0.0;

            return [lat, lng, altitude].join(",");
        }, [center?.lat, center?.lng, center?.altitude]);

        useEffect(() => {
            if (!map3DElement || !props.onClick) return;

            // Cast the click handler to EventListener type to satisfy addEventListener's type requirements
            const handleClick = ((
                event: google.maps.maps3d.LocationClickEvent,
            ) => {
                if (event.position) {
                    props.onClick(event.position);
                }
            }) as EventListener;

            map3DElement.addEventListener("gmp-click", handleClick);

            return () =>
                map3DElement.removeEventListener("gmp-click", handleClick);
        }, [map3DElement, props.onClick]);

        if (!customElementsReady) return null;

        return (
            <gmp-map-3d
                ref={map3dRef}
                center={centerString}
                heading={String(props.heading)}
                range={String(props.range)}
                roll={String(props.roll)}
                tilt={String(props.tilt)}
            >
                {props.children}
            </gmp-map-3d>
        );
    },
);

Map3D.displayName = "Map3D";
