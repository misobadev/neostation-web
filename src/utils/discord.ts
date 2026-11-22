export const DISCORD_INVITE = "xE2kgKsRVq";
export const DISCORD_URL = `https://discord.gg/${DISCORD_INVITE}`;
export const DISCORD_API = `https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true`;

export interface DiscordCounts {
	members: number;
	online: number;
}

export async function fetchDiscordCounts(): Promise<DiscordCounts | null> {
	try {
		const res = await fetch(DISCORD_API, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return null;
		const data = await res.json();
		const members = Number(data.approximate_member_count);
		if (!Number.isFinite(members) || members <= 0) return null;
		return { members, online: Number(data.approximate_presence_count) || 0 };
	} catch {
		return null;
	}
}

// Fetched once per build and shared by every page that renders the header.
let buildCounts: Promise<DiscordCounts | null> | undefined;
export function getDiscordCounts() {
	buildCounts ??= fetchDiscordCounts();
	return buildCounts;
}

export function formatCount(n: number) {
	if (n < 10_000) return new Intl.NumberFormat("en").format(n);
	return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1, roundingMode: "floor" }).format(n);
}
