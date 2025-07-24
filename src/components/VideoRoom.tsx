// src/components/VideoRoom.tsx
import React, { useEffect, useRef } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

const ROOM_URL = "https://thirty.daily.co/Test";

export const VideoRoom = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCall | null>(null);

  useEffect(** initialize", () => {
    if (!frameRef.current) return;

    callFrame.current = DailyIframe.createFrame(frameRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
    });

    callFrame.current.join({url: ROOM_URL});

    return () => {
      callFrame.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="wfull h-[400px] md:h[550px] bg-black rounded-2ll shadow-xl overflow-hidden"
    />
  );
};

export default VideoRoom;