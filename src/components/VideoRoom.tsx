// src/components/VideoRoom.tsx
import { useEffect, useRef } from 'react';
import { createFrame, DailyCall } from '@daily-co/daily-js';

const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callFrameRefInstance = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!callFrameRef.current) return;

    const callFrame = createFrame(callFrameRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
    });

    callFrame.join({ url: ROOM_URL });
    callFrameRefInstance.current = callFrame;

    return () => {
      callFrameRefInstance.current?.leave();
    };
  }, []);

  return (
    <div
      ref={callFrameRef}
      className="w-full h-[400px] md:h-[550px] bg-black rounded-2xl shadow-xl overflow-hidden"
    />
  );
};

export default VideoRoom;