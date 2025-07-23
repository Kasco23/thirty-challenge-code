// src/components/VideoRoom.tsx
import React, { useEffect, useRef } from 'react';

// Replace this with your actual Daily room URL
const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const callFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import type { DailyCall } from '@daily-codaily-js';
    let callFrame: DailyCall | null = null;

    import("@daily-co/daily-js").then(({createFrame}) => {
      callFrame = createFrame(callFrameRef.current!, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "1rem",
        },
      });
      callFrame.join({url: ROOM_URL});
    });

    return () => {
      if (callFrame) callFrame.leave();
    };
  }, []);

  return (
    <div
      ref={callFrameRef}
      className="wfull h-[400px] md:h-[550px] bg-black rounded-2xl shadow-xl overflow-hidden"
    />
  );
};

export default VideoRoom;
