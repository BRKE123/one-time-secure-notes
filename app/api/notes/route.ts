import { NextResponse } from "next/server";
import crypto from "crypto";

const notes = new Map<
  string,
  {
    iv: string;
    ciphertext: string;
  }
>();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.iv || !body.ciphertext) {
      return NextResponse.json(
        { error: "Invalid note" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");

    notes.set(token, {
      iv: body.iv,
      ciphertext: body.ciphertext,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400 }
    );
  }

  const note = notes.get(token);

  if (!note) {
    return NextResponse.json(
      { error: "Note not found or already viewed" },
      { status: 404 }
    );
  }

  // Delete immediately so the note can only be retrieved once.
  notes.delete(token);

  return NextResponse.json(note);
}
