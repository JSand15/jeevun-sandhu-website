"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/data/site";

// Submits straight to jeesand15@gmail.com via FormSubmit.co (no backend or
// API key needed). First real submission triggers a one-time confirmation
// email from FormSubmit that has to be clicked before delivery is live.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/jeesand15@gmail.com";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio contact from ${name}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  const statusMessage: Record<Status, string> = {
    idle: "This goes straight to my inbox. I'll get back to you as soon as I can.",
    sending: "Sending…",
    sent: `Sent. I'll get back to you soon. You can also reach me directly at ${siteConfig.email}.`,
    error: `Something went wrong. Email me directly at ${siteConfig.email} and I'll get back to you.`,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="self-start"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send message"}
        <Send className="size-4" aria-hidden="true" />
      </Button>

      <p role="status" className="text-muted-foreground text-sm">
        {statusMessage[status]}
      </p>
    </form>
  );
}
