import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { calendarHandler } from '../../app/api/ingest/calendar/route';
import { voiceHandler } from '../../app/api/ingest/voice/route';

// Mock the database and other dependencies
vi.mock('@rhiz/db', () => ({
  db: {
    insert: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
    select: vi.fn().mockResolvedValue([]),
  },
  encounter: {},
  person: {},
  claim: {},
}));

vi.mock('@rhiz/workers', () => ({
  addJob: vi.fn().mockResolvedValue({}),
}));

vi.mock('@rhiz/core', () => ({
  ModelRouter: vi.fn().mockImplementation(() => ({
    transcribeAudio: vi.fn().mockResolvedValue('Test transcription'),
    extractFromVoiceNote: vi.fn().mockResolvedValue({
      entities: ['Test Person'],
      needs: ['funding'],
      offers: ['expertise'],
      explicitGoals: ['raise_seed'],
    }),
  })),
}));

describe('API Routes', () => {
  describe('POST /api/ingest/calendar', () => {
    it('should accept ICS file and return success', async () => {
      const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
BEGIN:VEVENT
UID:test-event-1
DTSTART:20240115T100000Z
DTEND:20240115T110000Z
SUMMARY:Test Meeting
DESCRIPTION:Meeting with Sarah Chen
ATTENDEE:mailto:sarah@techcorp.com
END:VEVENT
END:VCALENDAR
      `;

      const req = {
        method: 'POST',
        body: { icsContent },
        headers: { 'content-type': 'application/json' },
      } as NextApiRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as NextApiResponse;

      await calendarHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          eventsProcessed: expect.any(Number),
        })
      );
    });

    it('should handle invalid ICS content', async () => {
      const req = {
        method: 'POST',
        body: { icsContent: 'invalid ics content' },
        headers: { 'content-type': 'application/json' },
      } as NextApiRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as NextApiResponse;

      await calendarHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });
  });

  describe('POST /api/ingest/voice', () => {
    it('should accept audio file and return transcription', async () => {
      const audioBuffer = Buffer.from('fake audio data');
      
      const req = {
        method: 'POST',
        body: { audioData: audioBuffer.toString('base64') },
        headers: { 'content-type': 'application/json' },
      } as NextApiRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as NextApiResponse;

      await voiceHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          transcription: 'Test transcription',
          entities: expect.any(Array),
          needs: expect.any(Array),
          offers: expect.any(Array),
          explicitGoals: expect.any(Array),
        })
      );
    });

    it('should handle missing audio data', async () => {
      const req = {
        method: 'POST',
        body: {},
        headers: { 'content-type': 'application/json' },
      } as NextApiRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as NextApiResponse;

      await voiceHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });
  });
});
