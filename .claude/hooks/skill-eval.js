#!/usr/bin/env node
/**
 * Skill Evaluation Engine
 *
 * UserPromptSubmit 훅에서 실행된다. stdin으로 들어온 Claude Code 훅 JSON(`{prompt: "..."}`)을
 * 읽어, skill-rules.json 규칙과 대조해 관련 스킬을 점수로 추천한다.
 *
 * 매칭 신호: keywords / keywordPatterns / pathPatterns / intentPatterns / directoryMappings
 *
 * 출력: UserPromptSubmit 훅은 stdout을 그대로 컨텍스트에 주입할 수 있으므로,
 *       추천 결과를 사람이 읽을 수 있는 리마인더 텍스트로 출력한다.
 */

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, 'skill-rules.json');

function loadRules() {
  try {
    return JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  } catch (_) {
    process.exit(0); // 규칙을 못 읽으면 조용히 통과
  }
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf-8');
  } catch (_) {
    return '';
  }
}

/** 훅 입력에서 사용자 프롬프트 텍스트를 뽑는다. */
function extractPrompt(raw) {
  if (!raw) return '';
  try {
    const obj = JSON.parse(raw);
    return obj.prompt || obj.user_prompt || obj.message || '';
  } catch (_) {
    // JSON이 아니면 원문 그대로 프롬프트로 취급
    return raw;
  }
}

/** 프롬프트에서 파일 경로처럼 보이는 토큰을 뽑는다. */
function extractPaths(prompt) {
  const paths = new Set();
  const re = /(?:^|\s|["'`])([\w\-./@]+\.(?:[tj]sx?|css|scss|json|md))\b/gi;
  let m;
  while ((m = re.exec(prompt)) !== null) paths.add(m[1]);
  // 디렉토리 언급 (src/xxx, features/xxx 등)
  const dre = /\b((?:src|features|shared|routes|components|hooks|queries|api|styles)\/[\w\-./]*)/gi;
  while ((m = dre.exec(prompt)) !== null) paths.add(m[1]);
  return [...paths];
}

function scoreSkill(skillName, skill, ctx) {
  const { promptLower, paths } = ctx;
  let score = 0;
  const reasons = [];
  const t = skill.triggers || {};

  for (const kw of t.keywords || []) {
    if (promptLower.includes(kw.toLowerCase())) {
      score += 2;
      reasons.push(`키워드 '${kw}'`);
    }
  }
  for (const pat of t.keywordPatterns || []) {
    try {
      if (new RegExp(pat, 'i').test(promptLower)) {
        score += 2;
        reasons.push(`패턴 매칭`);
      }
    } catch (_) {}
  }
  for (const glob of t.pathPatterns || []) {
    const re = globToRegExp(glob);
    if (paths.some((p) => re.test(p))) {
      score += 3;
      reasons.push(`경로 '${glob}'`);
    }
  }
  for (const pat of t.intentPatterns || []) {
    try {
      if (new RegExp(pat, 'i').test(promptLower)) {
        score += 1;
        reasons.push(`의도 매칭`);
      }
    } catch (_) {}
  }
  return { name: skillName, score, reasons: [...new Set(reasons)] };
}

/** 아주 단순한 glob → RegExp (** 와 * 만 지원) */
function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*');
  return new RegExp(escaped);
}

function main() {
  const rules = loadRules();
  const cfg = rules.config || {};
  const minScore = cfg.minConfidenceScore ?? 3;
  const maxShow = cfg.maxSkillsToShow ?? 5;

  const prompt = extractPrompt(readStdin());
  if (!prompt.trim()) process.exit(0);

  const ctx = {
    promptLower: prompt.toLowerCase(),
    paths: extractPaths(prompt),
  };

  // directoryMappings: 언급된 경로가 매핑된 스킬이면 가산
  const dirBonus = {};
  for (const [dir, skillName] of Object.entries(rules.directoryMappings || {})) {
    if (ctx.paths.some((p) => p.includes(dir))) {
      dirBonus[skillName] = (dirBonus[skillName] || 0) + 3;
    }
  }

  const results = [];
  for (const [name, skill] of Object.entries(rules.skills || {})) {
    const r = scoreSkill(name, skill, ctx);
    if (dirBonus[name]) {
      r.score += dirBonus[name];
      r.reasons.push('디렉토리 매핑');
    }
    if (r.score >= minScore) results.push(r);
  }

  if (!results.length) process.exit(0);

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, maxShow);

  const lines = [
    '💡 이 작업과 관련된 스킬이 있습니다. 필요하면 참고하세요:',
    ...top.map((r) => `  • /${r.name} — ${r.reasons.join(', ')}`),
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

main();
