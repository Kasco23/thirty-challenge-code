import { useEffect, useRef } from "react";
import daily from "@daily-co/daily-js";

const ROOM_URL = "https://thirty.daily.co/Test";

const VideoRoom = () => {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = daily.createFrame({
    iframeStyle: {
      width: "100%",
      height: "100%",
      border: "0",
      borderRadius: "1rem",
    },
  });

    if (frameRef.current) {
      frameRef.current.appendChild(frame.iframe());
      frame.join({ url: ROOM_URL });
    }

    return () => {
      frame.leave();
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="wfull h-;400px md:h[550px] bg-black rounded-2xl shadow-xl everflow-hidden"
    />
  );
};

export default VideoRoom;