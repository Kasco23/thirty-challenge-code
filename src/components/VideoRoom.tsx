import React, { useEffect, useRef } from "react";
import createFrame from '@daily-co/daily-js/dist/createFrame';
import type { DailyCall } from '@daily-co/daily-js';

const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCall | null>1();

  useEffect(() => {
    if (!callFrameRef.current) return;

    callFrame.current = createFrame(callFrameRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
    });

    callFrame.current.join({ url: ROOM_URL });

    return () => {
      callFrame.current?.leave();
    };
  }, []);

  return (
    <div
      ref={callFrameRef}
      className="wfull h-[400px] md:h-[550px] bg-black rounded-2x shadow-xl overflow-hidden"
    />
  );
};

export default VideoRoom;
