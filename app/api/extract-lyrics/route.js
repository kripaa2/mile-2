import { NextResponse } from "next/server";
import * as mm from "music-metadata";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse metadata
        const metadata = await mm.parseBuffer(buffer, file.type);

        const song = metadata.common.title;
        const artist = metadata.common.artist;

        if (!song || !artist) {
            return NextResponse.json({
                error: "Could not extract metadata from audio file. Please enter the song and artist manually. 🌸",
                needsManualEntry: true
            });
        }

        // Fetch lyrics using the metadata
        const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        const lyricsData = await lyricsRes.json();

        if (lyricsData.lyrics) {
            return NextResponse.json({
                success: true,
                song,
                artist,
                lyrics: lyricsData.lyrics
            });
        } else {
            return NextResponse.json({
                success: false,
                song,
                artist,
                error: `Found song details (${song} by ${artist}), but couldn't find the lyrics. 😿`
            });
        }

    } catch (error) {
        console.error("Error processing audio:", error);
        return NextResponse.json({ error: "Failed to process audio file. 💔" }, { status: 500 });
    }
}
