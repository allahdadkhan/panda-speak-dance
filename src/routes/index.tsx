import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talking Panda — Speak and the Panda Repeats" },
      {
        name: "description",
        content:
          "Talk to a 3D panda that listens, repeats what you say, and dances on cue.",
      },
      { property: "og:title", content: "Talking Panda — Speak and the Panda Repeats" },
      {
        property: "og:description",
        content:
          "Talk to a 3D panda that listens, repeats what you say, and dances on cue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/panda.html"
      title="Talking Panda"
      allow="microphone; autoplay"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  );
}
