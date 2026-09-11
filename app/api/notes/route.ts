import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

type StoredNote = {
  iv: string;
  ciphertext: string;
};

const NOTE_TTL_SECONDS = 24 * 60 * 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body?.iv !== "string" ||
      typeof body?.ciphertext !== "string" ||
      !body.iv ||
      !body.ciphertext
    ) {
      return NextResponse.json(
        { error: "Invalid note" },
        { status: 400 }
      );
    }

    const token = randomBytes(24).toString("hex");

    const note: StoredNote = {
      iv: body.iv,
      ciphertext: body.ciphertext,
    };

    await redis.set(`note:${token}`, note, {
      ex: NOTE_TTL_SECONDS,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Unable to create note" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token || !/^[a-f0-9]{48}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // GETDEL is atomic:
    // the first request gets the note and deletes it.
    // Every later request receives null.
    const note = await redis.getdel<StoredNote>(`note:${token}`);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or already opened" },
        { status: 404 }
      );
    }

    return NextResponse.json(note, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve note" },
      { status: 500 }
    );
  }
}
