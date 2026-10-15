"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Speaker = "player" | "advisor";
export type Line = { id: string; speaker: Speaker; text: string; done: boolean };
export type Status = "idle" | "connecting" | "live" | "error";

type ServerEvent = {
  type: string;
  item_id?: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
};

export function useRealtimeDialogue() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [muted, setMuted] = useState(false);
  const [advisorSpeaking, setAdvisorSpeaking] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const upsert = useCallback(
    (id: string, speaker: Speaker, update: (prev: string) => string, done = false) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.id === id);
        if (i === -1) return [...prev, { id, speaker, text: update(""), done }];
        const next = [...prev];
        next[i] = { ...next[i], text: update(next[i].text), done: done || next[i].done };
        return next;
      });
    },
    [],
  );

  const handleEvent = useCallback(
    (e: ServerEvent) => {
      switch (e.type) {
        // Reserve the player's slot when their turn ends so it sorts before the reply.
        case "input_audio_buffer.committed":
          if (e.item_id) upsert(e.item_id, "player", (t) => t);
          break;
        case "conversation.item.input_audio_transcription.completed":
          if (e.item_id) upsert(e.item_id, "player", () => e.transcript?.trim() || "…", true);
          break;
        case "response.output_audio_transcript.delta":
        case "response.audio_transcript.delta":
          if (e.item_id) upsert(e.item_id, "advisor", (t) => t + (e.delta ?? ""));
          break;
        case "response.output_audio_transcript.done":
        case "response.audio_transcript.done":
          if (e.item_id) upsert(e.item_id, "advisor", (t) => e.transcript ?? t, true);
          break;
        case "output_audio_buffer.started":
          setAdvisorSpeaking(true);
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
          setAdvisorSpeaking(false);
          break;
        case "error":
          setError(e.error?.message ?? "Realtime error");
          break;
      }
    },
    [upsert],
  );

  const stop = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    setAdvisorSpeaking(false);
    setMuted(false);
    setStatus("idle");
  }, []);

  // Temporary default until the engine deals pitches; the realtime stream replaces this hook.
  const start = useCallback(async (pitchId: string = "cayman-property-fund") => {
    setError(null);
    setLines([]);
    setStatus("connecting");
    try {
      const tokenRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitchId }),
      });
      const token = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(token.error ?? "Could not start session");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audio = new Audio();
      audioRef.current = audio;
      pc.ontrack = (ev) => {
        audio.srcObject = ev.streams[0];
        void audio.play();
      };

      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = mic;
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));

      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (msg) => handleEvent(JSON.parse(msg.data));
      // Let the advisor open the conversation.
      dc.onopen = () => {
        setStatus("live");
        dc.send(JSON.stringify({ type: "response.create" }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          setError("Connection lost");
          stop();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token.clientSecret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpRes.ok) throw new Error(`Realtime connect failed (${sdpRes.status}): ${await sdpRes.text()}`);

      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
    } catch (err) {
      stop();
      const micBlocked = err instanceof DOMException && err.name === "NotAllowedError";
      setError(
        micBlocked
          ? "Kenny needs your microphone. Allow mic access in your browser's address bar and try again."
          : err instanceof Error
            ? err.message
            : String(err),
      );
      setStatus("error");
    }
  }, [handleEvent, stop]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    micRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [muted]);

  useEffect(() => stop, [stop]);

  return { status, error, lines, muted, advisorSpeaking, start, stop, toggleMute };
}
