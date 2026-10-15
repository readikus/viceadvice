"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BrochureId, KennyEvent, KennyVoice, SessionResponse, Speaker, TranscriptLine, VoiceStatus } from "@/game/types";
import { SHOW_BROCHURE_TOOL } from "./tools";

type ServerEvent = {
  type: string;
  item_id?: string;
  delta?: string;
  transcript?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  error?: { message?: string; code?: string };
};

/** Errors that only mean "nothing to cancel" or "you didn't say anything"; not worth showing. */
const HARMLESS_ERRORS = new Set(["response_cancel_not_active", "input_audio_buffer_commit_empty"]);

/** Releases shorter than this are treated as a slip of the finger, not a turn. */
const MIN_TALK_MS = 250;
/** Keep the mic open briefly after release so the end of the sentence reaches OpenAI. */
const RELEASE_TAIL_MS = 200;

const BROCHURES: readonly BrochureId[] = ["fund", "vip-club", "pension-transfer", "statement"];

/**
 * Kenny's voice for the game: one OpenAI Realtime session per pitch, over WebRTC,
 * with push-to-talk. Built on Ian's original useRealtimeDialogue hook.
 *
 * The mic permission is asked for once and the stream reused across pitches;
 * each pitch gets a fresh peer connection and a fresh session with its own brief.
 */
export function useKennyVoice(): KennyVoice {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [kennySpeaking, setKennySpeaking] = useState(false);
  const [playerTalking, setPlayerTalking] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelBufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const handlersRef = useRef(new Set<(event: KennyEvent) => void>());
  const pressedAtRef = useRef<number | null>(null);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kennySpeakingRef = useRef(false);
  /** Set when Kenny called a tool; we ask him to carry on once his response is done. */
  const continueAfterToolRef = useRef(false);
  /** Bumped on every start/end so late events from an old session are ignored. */
  const sessionRef = useRef(0);

  const send = useCallback((event: object) => {
    const dc = dcRef.current;
    if (dc?.readyState === "open") dc.send(JSON.stringify(event));
  }, []);

  const setMicLive = (live: boolean) => {
    micRef.current?.getAudioTracks().forEach((t) => (t.enabled = live));
  };

  const setSpeaking = (speaking: boolean) => {
    kennySpeakingRef.current = speaking;
    setKennySpeaking(speaking);
  };

  const upsert = useCallback(
    (id: string, speaker: Speaker, update: (prev: string) => string, done = false) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.id === id);
        if (i === -1) return [...prev, { id, speaker, text: update(""), done, at: Date.now() }];
        const next = [...prev];
        next[i] = { ...next[i], text: update(next[i].text), done: done || next[i].done };
        return next;
      });
    },
    [],
  );

  const handleToolCall = useCallback(
    (e: ServerEvent) => {
      let output: object = { ok: false, error: "Unknown tool" };
      if (e.name === SHOW_BROCHURE_TOOL) {
        const args = (() => {
          try {
            return JSON.parse(e.arguments ?? "{}") as { brochure?: unknown };
          } catch {
            return {};
          }
        })();
        const brochure = BROCHURES.find((b) => b === args.brochure);
        if (brochure) {
          handlersRef.current.forEach((h) => h({ type: "show_brochure", brochure }));
          output = { ok: true, note: "The brochure is now on the desk in front of the player." };
        } else {
          output = { ok: false, error: "No such brochure" };
        }
      }
      send({ type: "conversation.item.create", item: { type: "function_call_output", call_id: e.call_id, output: JSON.stringify(output) } });
      continueAfterToolRef.current = true;
    },
    [send],
  );

  const handleEvent = useCallback(
    (e: ServerEvent) => {
      switch (e.type) {
        // Reserve the player's slot when their turn is committed so it sorts before the reply.
        case "input_audio_buffer.committed":
          if (e.item_id) upsert(e.item_id, "player", (t) => t);
          break;
        case "conversation.item.input_audio_transcription.completed":
          if (e.item_id) upsert(e.item_id, "player", () => e.transcript?.trim() || "…", true);
          break;
        case "response.output_audio_transcript.delta":
          if (e.item_id) upsert(e.item_id, "kenny", (t) => t + (e.delta ?? ""));
          break;
        case "response.output_audio_transcript.done":
          if (e.item_id) upsert(e.item_id, "kenny", (t) => e.transcript ?? t, true);
          break;
        case "output_audio_buffer.started":
          setSpeaking(true);
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
          setSpeaking(false);
          break;
        case "response.function_call_arguments.done":
          handleToolCall(e);
          break;
        case "response.done":
          if (continueAfterToolRef.current) {
            continueAfterToolRef.current = false;
            send({ type: "response.create" });
          }
          break;
        case "error":
          if (!HARMLESS_ERRORS.has(e.error?.code ?? "")) setError(e.error?.message ?? "Realtime error");
          break;
      }
    },
    [upsert, handleToolCall, send],
  );

  const endPitch = useCallback(() => {
    sessionRef.current++;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    analyserRef.current = null;
    setMicLive(false);
    pressedAtRef.current = null;
    continueAfterToolRef.current = false;
    setPlayerTalking(false);
    setSpeaking(false);
    setStatus("idle");
  }, []);

  const startPitch = useCallback(
    async (pitchId: string) => {
      endPitch();
      const session = sessionRef.current;
      const stale = () => session !== sessionRef.current;
      setError(null);
      setLines([]);
      setStatus("connecting");
      try {
        // Ask for the mic first: it needs the click that started the pitch.
        if (!micRef.current) {
          micRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        }
        setMicLive(false);
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        void audioCtxRef.current.resume();

        const tokenRes = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pitchId }),
        });
        const token = (await tokenRes.json()) as Partial<SessionResponse> & { error?: string };
        if (!tokenRes.ok || !token.clientSecret) throw new Error(token.error ?? "Could not start session");
        if (stale()) return;

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        pc.ontrack = (ev) => {
          const stream = ev.streams[0];
          audio.srcObject = stream;
          void audio.play();
          // Tap Kenny's voice for the lip-sync. The audio element does the playing.
          const ctx = audioCtxRef.current;
          if (ctx) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            ctx.createMediaStreamSource(stream).connect(analyser);
            analyserRef.current = analyser;
            levelBufRef.current = new Uint8Array(analyser.fftSize);
          }
        };

        micRef.current.getTracks().forEach((t) => pc.addTrack(t, micRef.current!));

        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;
        dc.onmessage = (msg) => {
          if (!stale()) handleEvent(JSON.parse(msg.data));
        };
        // Kenny opens the pitch.
        dc.onopen = () => {
          if (stale()) return;
          setStatus("live");
          dc.send(JSON.stringify({ type: "response.create" }));
        };

        pc.onconnectionstatechange = () => {
          if (!stale() && pc.connectionState === "failed") {
            endPitch();
            setError("Connection lost");
            setStatus("error");
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
          method: "POST",
          body: offer.sdp,
          headers: { Authorization: `Bearer ${token.clientSecret}`, "Content-Type": "application/sdp" },
        });
        if (!sdpRes.ok) throw new Error(`Realtime connect failed (${sdpRes.status}): ${await sdpRes.text()}`);
        if (stale()) return;

        await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
      } catch (err) {
        if (stale()) return;
        endPitch();
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
    },
    [endPitch, handleEvent],
  );

  const pressTalk = useCallback(() => {
    if (!dcRef.current || pressedAtRef.current !== null) return;
    if (releaseTimerRef.current) {
      // Pressed again inside the release tail: carry on the same turn.
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    } else {
      // Talking over Kenny cuts him off, like a real conversation.
      if (kennySpeakingRef.current) {
        send({ type: "response.cancel" });
        send({ type: "output_audio_buffer.clear" });
      }
      send({ type: "input_audio_buffer.clear" });
    }
    pressedAtRef.current = Date.now();
    setMicLive(true);
    setPlayerTalking(true);
  }, [send]);

  const releaseTalk = useCallback(() => {
    const pressedAt = pressedAtRef.current;
    if (pressedAt === null) return;
    pressedAtRef.current = null;
    setPlayerTalking(false);
    const heldFor = Date.now() - pressedAt;
    releaseTimerRef.current = setTimeout(() => {
      releaseTimerRef.current = null;
      setMicLive(false);
      if (heldFor < MIN_TALK_MS) {
        send({ type: "input_audio_buffer.clear" });
        return;
      }
      send({ type: "input_audio_buffer.commit" });
      send({ type: "response.create" });
    }, RELEASE_TAIL_MS);
  }, [send]);

  const getKennyLevel = useCallback(() => {
    const analyser = analyserRef.current;
    const buf = levelBufRef.current;
    if (!analyser || !buf) return 0;
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    // RMS of speech sits around 0.05 to 0.3; stretch it to 0..1.
    return Math.min(1, Math.sqrt(sum / buf.length) * 4);
  }, []);

  const onEvent = useCallback((handler: (event: KennyEvent) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  useEffect(
    () => () => {
      endPitch();
      micRef.current?.getTracks().forEach((t) => t.stop());
      micRef.current = null;
      void audioCtxRef.current?.close();
      audioCtxRef.current = null;
    },
    [endPitch],
  );

  return {
    status,
    error,
    lines,
    kennySpeaking,
    playerTalking,
    startPitch,
    endPitch,
    pressTalk,
    releaseTalk,
    getKennyLevel,
    onEvent,
  };
}
