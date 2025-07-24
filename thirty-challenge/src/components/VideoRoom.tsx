import { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const callFrameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const callFrame = DailyIframe.createFrame({
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
    });

    const iframe = callFrame.iframe();
    if (callFrameRef.current && iframe) {
      callFrameRef.current.appendChild(iframe);
      callFrame.join({ url: ROOM_URL });
    }

    return () => {
      callFrame.leave();
    };
  }, []);

  return (
    <div
      ref={callFrameRef}
      className="wfull h-[400px] md:h[550px] bg-black rounded-2xl shadow-xl everflow-hidden"
    />
  );
};

export default VideoRoom;