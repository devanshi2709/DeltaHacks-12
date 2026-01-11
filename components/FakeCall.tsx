import React, { useEffect, useRef, useState } from "react";

type Props = {
  onEnd: () => void;
};

const FakeCall: React.FC<Props> = ({ onEnd }) => {
  const [status, setStatus] = useState<"ringing" | "playing" | "done" | "error">(
    "ringing"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCall() {
      try {
        setStatus("ringing");

        // Small ring delay so it feels real (demo-friendly)
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;

        const res = await fetch("http://localhost:3001/api/voice/fake-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text:
              "Hey! Oh my god, I've been trying to reach you! " +
              "There's a family emergency—you need to come home RIGHT NOW. " +
              "No, it can't wait. I need you here in 20 minutes. Okay—see you soon. Hurry!",
          }),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Backend error ${res.status}`);
        }

        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;

        setStatus("playing");
        await audio.play();

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setStatus("done");
          // End quickly for demo (no 45s wait)
          setTimeout(onEnd, 600);
        };
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    }

    startCall();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onEnd]);

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 text-white shadow-2xl">
        <div className="text-xs uppercase tracking-widest text-zinc-400 font-black">
          Fake Call
        </div>

        <div className="mt-3 text-2xl font-black">
          {status === "ringing" && "📞 Incoming call…"}
          {status === "playing" && "📞 Call in progress…"}
          {status === "done" && "✅ Call ended"}
          {status === "error" && "❌ Call failed"}
        </div>

        <div className="mt-4 text-sm text-zinc-400">
          {status === "ringing" && "Hold on — generating voice…"}
          {status === "playing" && "Stay calm. Use this as an excuse to leave."}
          {status === "done" && "Are you safe now?"}
          {status === "error" && "Check backend is running on :3001"}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onEnd}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-2xl py-3 font-black text-xs uppercase tracking-widest"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};

export default FakeCall;
