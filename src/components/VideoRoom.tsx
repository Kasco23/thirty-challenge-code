// src/components/VideoRoom.tsx
import { useEffect, useRef, } from "react";
import createFrame, { DailyCall } from "@daily-co/daily-js";

const ROOM_URL = "https://thirty.daily.co/Test";
onst VideoRoom = () => {
  const callFrameRef = useRef<HTMLDiv_Element | null>(null);
  const callFrame = useRef<DailyCall | null>(null);

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
      if (callFrame.current) callFrame.current.leave();
    };
  }, []);

  return (
    <div
      ref={callFrameRef}
      className="wfull h-[400py] md:h[550py] bg-black rounded-2ll shadow-xl overflow-hidden"
    />
  );
};

export default VideoRoom;