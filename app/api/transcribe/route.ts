import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import os from 'os';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  let tempFilePath: string | null = null;

  try {
    const { audio } = await request.json();
    
    if (!audio) {
      console.error('No audio data received');
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    if (!audio.startsWith('data:audio')) {
      console.error('Invalid audio format received');
      return NextResponse.json(
        { error: 'Invalid audio format. Expected base64 audio data.' },
        { status: 400 }
      );
    }

    console.log('Processing audio data...');
    
    // Convert base64 to buffer
    const base64Data = audio.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid base64 audio data' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write buffer to temporary file
    tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    await writeFile(tempFilePath, buffer);
    
    console.log('Audio buffer created, sending to OpenAI...');

    // Create a temporary file with the audio data
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'en',  // Force English language
      response_format: 'json',
      prompt: 'This is a todo list. The audio will contain tasks in English.',  // Help guide the model
    });

    // Clean up temporary file
    if (tempFilePath) {
      await unlink(tempFilePath);
    }

    if (!response.text) {
      throw new Error('No transcription received from OpenAI');
    }

    console.log('Transcription received:', response.text);
    
    // Extract tasks and estimate time using GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a task extraction assistant. When given text input in any language, first translate it to English if needed, then identify and separate distinct tasks and estimate time for each.
Return a JSON array of tasks in English, where each task has a title and estimatedTime in minutes.
Example input: "Buy groceries, call mom, and finish report"
Example output: [
  {"title": "Buy groceries", "estimatedTime": 30},
  {"title": "Call mom", "estimatedTime": 15},
  {"title": "Finish report", "estimatedTime": 60}
]`
        },
        {
          role: 'user',
          content: response.text,
        },
      ],
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response received from GPT');
    }

    try {
      const tasks = JSON.parse(completion.choices[0].message.content);
      console.log('Tasks extracted:', tasks);
      
      if (!Array.isArray(tasks) || tasks.some(task => !task.title || !task.estimatedTime)) {
        throw new Error('Invalid task data format');
      }

      return NextResponse.json(tasks);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse task data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error details:', error);
    
    // Clean up temporary file if it exists
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process audio';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or missing';
        statusCode = 401;
      } else if (error.message.includes('audio')) {
        errorMessage = 'Invalid audio format';
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
