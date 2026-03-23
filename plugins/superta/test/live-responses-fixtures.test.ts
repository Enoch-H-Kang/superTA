import assert from 'node:assert/strict';
import { runLiveResponsesFixtureComparison } from '../../../evals/run-live-responses-fixtures.js';

export async function runLiveResponsesFixtureTests() {
  const originalProvider = process.env.SUPERTA_CLASSIFIER_PROVIDER;
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;

  process.env.SUPERTA_CLASSIFIER_PROVIDER = 'responses';
  process.env.OPENAI_API_KEY = 'test-key';
  globalThis.fetch = (async (_url: string, init?: { body?: string }) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    const userInput = body?.input?.find?.((item: { role?: string }) => item.role === 'user')?.content ?? '';
    const parsed = JSON.parse(userInput);
    const subject = String(parsed?.thread?.subject ?? '');

    let payload;
    if (subject.includes('late homework')) {
      payload = { category: 'deadline', action: 'draft_for_professor', confidence: 0.9, riskTier: 1, requiredSources: ['policy'], shouldUpdateFaq: false, shouldNotifyProfessor: false, reason: 'mock live routine' };
    } else if (subject.includes('grade') || subject.includes('Canvas')) {
      payload = { category: 'grade-related', action: 'escalate_now', confidence: 0.9, riskTier: 3, requiredSources: ['policy'], shouldUpdateFaq: false, shouldNotifyProfessor: true, reason: 'mock live grade' };
    } else if (subject.includes('misconduct')) {
      payload = { category: 'integrity-sensitive', action: 'escalate_now', confidence: 0.9, riskTier: 3, requiredSources: ['policy'], shouldUpdateFaq: false, shouldNotifyProfessor: true, reason: 'mock live integrity' };
    } else if (subject.includes('overwhelmed') || subject.includes('flexibility')) {
      payload = { category: 'wellbeing/safety', action: 'escalate_now', confidence: 0.9, riskTier: 3, requiredSources: ['policy'], shouldUpdateFaq: false, shouldNotifyProfessor: true, reason: 'mock live wellbeing' };
    } else if (subject.includes('Exam logistics')) {
      payload = { category: 'accommodation-sensitive', action: 'escalate_now', confidence: 0.9, riskTier: 3, requiredSources: ['policy'], shouldUpdateFaq: false, shouldNotifyProfessor: true, reason: 'mock live accommodation' };
    } else {
      payload = { category: 'other', action: 'needs_more_info', confidence: 0.1, riskTier: 1, requiredSources: [], shouldUpdateFaq: false, shouldNotifyProfessor: true, reason: 'mock live fallback' };
    }

    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({ output: [{ content: [{ text: JSON.stringify(payload) }] }] });
      },
    } as any;
  }) as any;

  try {
    const result = await runLiveResponsesFixtureComparison();
    assert.equal(result.provider, 'responses-live');
    assert.ok(result.results.length >= 5);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalProvider === undefined) delete process.env.SUPERTA_CLASSIFIER_PROVIDER; else process.env.SUPERTA_CLASSIFIER_PROVIDER = originalProvider;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  }
}
