import { useState } from "react";
const metaphors = [
    {
        title: "Leaves on a Stream",
        text: "Imagine placing each intrusive thought on a leaf and watching it float away down a gentle stream. You don't need to grab it. Just watch it pass.",
    },
    {
        title: "Radio Doom & Gloom",
        text: "Your mind is like a radio station called 'Radio Doom & Gloom.' You can notice it's playing without turning up the volume. Thank your mind for the broadcast.",
    },
    {
        title: "The Unwelcome Party Guest",
        text: "The thought is like an uninvited guest at a party. You don't have to entertain them. Acknowledge their presence and return to what matters.",
    },
    {
        title: "Passengers on the Bus",
        text: "You are the bus driver. Intrusive thoughts are rowdy passengers. They can shout directions, but you keep driving toward your values.",
    },
    {
        title: "Clouds in the Sky",
        text: "You are the sky. Thoughts are just clouds passing through—some dark, some light. None of them are you. None of them stay forever.",
    },
    {
        title: "The Tug-of-War Monster",
        text: "You're in a tug-of-war with a thought-monster over a pit. The winning move? Drop the rope. The monster stays, but you're free.",
    },
];
export default function ACTSOSModal({ open, onClose }) {
    const [current, setCurrent] = useState(() => Math.floor(Math.random() * metaphors.length));
    const shuffle = () => {
        let next;
        do {
            next = Math.floor(Math.random() * metaphors.length);
        } while (next === current && metaphors.length > 1);
        setCurrent(next);
    };
    if (!open)
        return null;
    const m = metaphors[current];
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"/>
      <div className="relative neuro-card max-w-md w-full p-8 text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
          Cognitive Defusion
        </p>
        <h2 className="text-2xl font-bold mb-4">{m.title}</h2>
        <p className="text-muted-foreground text-base leading-relaxed mb-6">{m.text}</p>
        <div className="flex gap-3 justify-center">
          <button className="neuro-btn-outline text-sm" onClick={shuffle}>
            Another Metaphor
          </button>
          <button className="neuro-btn-primary text-sm" onClick={onClose}>
            I Feel Better
          </button>
        </div>
      </div>
    </div>);
}
