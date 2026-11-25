import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { coaches } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { formatWhen } from "@/lib/format";
import { PremiumLock } from "@/components/athlete/PremiumLock";
import { isPremium } from "@/lib/premium";
import { Avatar, BottomSheet, Btn, Chip, EmptyState, Page, PullToRefresh, SearchField, useListState } from "@/components/athlete/ui";

export function ChatListScreen() {
  const { athlete, conversations, messages, blockedCoachIds } = useApp();
  const list = useListState();
  const [query, setQuery] = useState("");
  const rows = conversations
    .filter((conversation) => conversation.athleteId === athlete?.id)
    .map((conversation) => {
      const coach = coaches.find((item) => item.id === conversation.coachId);
      const thread = messages.filter((item) => item.conversationId === conversation.id).sort((a, b) => (a.at < b.at ? 1 : -1));
      const latest = thread[0];
      const unread = thread.some((item) => item.from === "coach" && item.at > conversation.lastReadAt);
      return { conversation, coach, latest, unread };
    })
    .filter((row) => !query || `${row.coach?.name ?? ""} ${row.latest?.body ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  if (!isPremium()) {
    return (
      <Page title="Messages" back={false}>
        <PremiumLock title="Messages" />
      </Page>
    );
  }

  return (
    <Page title="Messages" back={false}>
      <PullToRefresh onRefresh={list.refresh}>
        <SearchField value={query} onChange={setQuery} placeholder="Search conversations" />
        <div className="mt-4 space-y-2">
          {list.loading && <div className="h-24 animate-pulse rounded-3xl bg-muted" />}
          {!list.loading && rows.length === 0 && (
            <EmptyState title="No conversations" body="Messages start after you contact a coach from a team page. Nothing here is live." to="/teams" action="Find a coach" />
          )}
          {rows.map((row) => (
            <Link key={row.conversation.id} to="/chat/$conversationId" params={{ conversationId: row.conversation.id }} className="flex min-h-16 items-center gap-3 rounded-3xl bg-card px-3 py-3 ring-1 ring-border">
              <Avatar name={row.coach?.name ?? "Coach"} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{row.coach?.name}</span>
                  {row.unread && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{row.latest?.body ?? "No messages yet"}</span>
                {blockedCoachIds.includes(row.conversation.coachId) && <span className="text-xs text-destructive">Blocked</span>}
              </span>
            </Link>
          ))}
        </div>
      </PullToRefresh>
    </Page>
  );
}

export function ChatThreadScreen({ conversationId }: { conversationId: string }) {
  const { athlete, conversations, messages, sendMessage, markConversationRead, blockCoach, reportCoach, blockedCoachIds } = useApp();
  const conversation = conversations.find((item) => item.id === conversationId && item.athleteId === athlete?.id);
  const coach = coaches.find((item) => item.id === conversation?.coachId);
  const thread = messages.filter((item) => item.conversationId === conversationId).sort((a, b) => (a.at > b.at ? 1 : -1));
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");
  const [sheet, setSheet] = useState(false);
  const [reason, setReason] = useState("Uncomfortable message");
  const locked = athlete?.whoCanMessage === "none" || (coach ? blockedCoachIds.includes(coach.id) : false);

  useEffect(() => {
    if (!conversation) return;
    const unread = messages.some(
      (message) => message.conversationId === conversation.id && message.from === "coach" && message.at > conversation.lastReadAt,
    );
    if (unread) markConversationRead(conversation.id);
  }, [conversation, messages, markConversationRead]);

  if (!isPremium()) {
    return <Page title="Messages"><PremiumLock title="Messages" /></Page>;
  }

  if (!conversation || !coach || !athlete) {
    return <Page title="Chat"><EmptyState title="Conversation not found" body="It may belong to another athlete." to="/chat" action="All chats" /></Page>;
  }

  return (
    <Page
      title={coach.name}
      right={
        <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => setSheet(true)}>
          Safety
        </button>
      }
    >
      <Link to="/coaches/$coachId" params={{ coachId: coach.id }} className="mb-4 block text-sm font-semibold text-link">View coach profile</Link>
      {athlete.whoCanMessage === "none" && (
        <p className="mb-3 rounded-2xl bg-warning/20 p-3 text-sm">Messaging is off for this athlete. A parent can change that in Privacy. You can still read what is already here.</p>
      )}
      <div className="space-y-3">
        {thread.length === 0 && <EmptyState title="No messages yet" body="Write the first note when messaging is allowed." />}
        {thread.map((message) => (
          <div key={message.id} className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm ${message.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-elevated"}`}>
            <p>{message.body}</p>
            {message.attachmentName && <p className="mt-1 text-xs opacity-80">{message.attachmentName}</p>}
            <p className={`mt-1 text-[0.7rem] ${message.from === "me" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {formatWhen(message.at)}{message.from === "me" ? " · Saved on device" : ""}
            </p>
          </div>
        ))}
      </div>
      <form
        className="mt-4 space-y-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = sendMessage(conversation.id, body, fileName || undefined);
          if (!result.ok) {
            toast(result.reason === "locked" ? "Messaging is turned off." : "Unblock this coach to write.");
            return;
          }
          setBody("");
          setFileName("");
        }}
      >
        <label className="block text-sm">
          <span className="sr-only">Message</span>
          <textarea value={body} disabled={locked} onChange={(event) => setBody(event.target.value)} className="min-h-20 w-full rounded-2xl bg-elevated px-3 py-3 text-base ring-1 ring-border disabled:opacity-50" placeholder={locked ? "Messaging is off" : "Write a message"} />
        </label>
        <input type="file" disabled={locked} aria-label="Attach a file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
        <Btn type="submit" full disabled={locked}>Send</Btn>
      </form>
      <BottomSheet open={sheet} title="Safety" onClose={() => setSheet(false)}>
        <p className="text-sm leading-relaxed text-muted-foreground">Report and block are stored on this device only. They are not sent to SpotMyRoster.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Uncomfortable message", "Asked to move off the app", "Wrong person", "Other"].map((item) => (
            <Chip key={item} selected={reason === item} onClick={() => setReason(item)}>{item}</Chip>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Btn full onClick={() => { reportCoach(coach.id, reason); toast("Report saved on this device"); setSheet(false); }}>Report</Btn>
          <Btn variant="danger" full onClick={() => { blockCoach(coach.id); toast("Coach blocked on this device"); setSheet(false); }}>Block</Btn>
        </div>
      </BottomSheet>
    </Page>
  );
}
