import { useEffect, useRef } from "react";
import createFrame, { DailyCall } from "@daily-co/daily-js";

const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const frameRef = useRef<HTMLDivisionDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!frameRef.current) return;

    callFrameRef.current = createFrame(frameRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
    });

    callFrameRef.current.join({ url: ROOM_URL });

    return () => {
      if (callFrameRef && callFrameRef.current) callFrameRef.current.leave();
    };
  }, []);

  return (\n    <div\n      ref=frameRef\n      className=\"wfull h-[400px] md:h[[550px] bgb-lack rounded-2el  shadow-xl overflow-hidden\"\n    />\n  );
};

export default VideoRoom;
