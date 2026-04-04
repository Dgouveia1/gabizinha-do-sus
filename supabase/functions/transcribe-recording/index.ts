import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * transcribe-recording — STUB
 *
 * When ready, uncomment the OpenAI Whisper section and set the env var:
 *   OPENAI_API_KEY=sk-...
 *
 * The function:
 * 1. Fetches the recording row by ID
 * 2. Downloads the audio file from Storage
 * 3. Sends to OpenAI Whisper for transcription
 * 4. Updates notebook_recordings with the transcript text
 */
Deno.serve(async (req: Request) => {
  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { recordingId } = await req.json();
  if (!recordingId) {
    return new Response(JSON.stringify({ error: "recordingId is required" }), { status: 400 });
  }

  // Mark as processing
  await supabase
    .from("notebook_recordings")
    .update({ transcript_status: "processing" })
    .eq("id", recordingId);

  // ─── STUB: Uncomment below + set OPENAI_API_KEY to activate ───
  //
  // const { data: recording } = await supabase
  //   .from("notebook_recordings")
  //   .select("file_url, file_name")
  //   .eq("id", recordingId)
  //   .single();
  //
  // const audioRes = await fetch(recording.file_url);
  // const audioBlob = await audioRes.blob();
  //
  // const formData = new FormData();
  // formData.append("file", audioBlob, recording.file_name || "audio.webm");
  // formData.append("model", "whisper-1");
  // formData.append("language", "pt");
  //
  // const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
  //   body: formData,
  // });
  //
  // const { text } = await whisperRes.json();
  // await supabase
  //   .from("notebook_recordings")
  //   .update({ transcript: text, transcript_status: "done" })
  //   .eq("id", recordingId);
  //
  // return new Response(JSON.stringify({ transcript: text }), {
  //   headers: { "Content-Type": "application/json" },
  // });
  // ─────────────────────────────────────────────────────────────

  // Rollback to pending while stub
  await supabase
    .from("notebook_recordings")
    .update({ transcript_status: "pending" })
    .eq("id", recordingId);

  return new Response(
    JSON.stringify({ status: "not_implemented", message: "Set OPENAI_API_KEY to enable transcription" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
