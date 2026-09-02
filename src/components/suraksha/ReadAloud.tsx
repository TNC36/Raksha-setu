import { useState, useEffect, useCallback } from "react";
import { Volume2, Pause, Play, Square } from "lucide-react";

interface ReadAloudProps {
  text: string;
  label?: string;
}

export default function ReadAloud({ text, label }: ReadAloudProps) {
  const [status, setStatus] = useState<"idle" | "speaking" | "paused">("idle");
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (!supported || !text) return;
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
    setStatus("speaking");
  }, [text, supported, stop]);

  const pause = useCallback(() => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setStatus("speaking");
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {label && (
        <span className="text-[11px] text-muted-foreground mr-1">{label}</span>
      )}
      {status === "idle" && (
        <button
          onClick={start}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:bg-primary/90 transition-colors"
          aria-label="Read aloud"
        >
          <Volume2 className="w-3 h-3" />
          Read Aloud
        </button>
      )}
      {status === "speaking" && (
        <>
          <button
            onClick={pause}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
            aria-label="Pause"
          >
            <Pause className="w-3 h-3" />
            Pause
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            aria-label="Stop"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>
        </>
      )}
      {status === "paused" && (
        <>
          <button
            onClick={resume}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
            aria-label="Resume"
          >
            <Play className="w-3 h-3" />
            Resume
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            aria-label="Stop"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>
        </>
      )}
    </div>
  );
}
