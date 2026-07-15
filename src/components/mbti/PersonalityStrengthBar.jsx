import React from 'react';

// Question IDs per dimension from MBTIQuiz
const DIMENSION_IDS = {
  EI: [1, 2, 3, 4, 17, 18, 19, 20],
  SN: [5, 6, 7, 8, 21, 22, 23, 24],
  TF: [9, 10, 11, 12, 25, 26, 27, 28],
  JP: [13, 14, 15, 16, 29, 30, 31, 32],
};

function calcDimensionStrength(answers, dim, positiveChar) {
  const ids = DIMENSION_IDS[dim];
  const answered = ids.filter(id => answers[id] !== undefined);
  if (answered.length === 0) return null;
  const positiveCount = answered.filter(id => answers[id] === positiveChar).length;
  return Math.round((positiveCount / answered.length) * 100);
}

function getStrengthLabel(pct) {
  if (pct >= 85) return 'very strong';
  if (pct >= 65) return 'strong';
  if (pct >= 50) return 'moderate';
  return 'light';
}

function DimensionRow({ leftLabel, rightLabel, letter, pct, pointsRight }) {
  // pct is % toward the winning side (letter)
  // pointsRight: true if letter is on right side
  const barPct = pct;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${!pointsRight ? 'text-white' : 'text-white/40'}`}>{leftLabel}</span>
        <span className={`text-sm font-medium ${pointsRight ? 'text-white' : 'text-white/40'}`}>{rightLabel}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        {pointsRight ? (
          <div
            className="absolute right-0 top-0 h-full rounded-full bg-[#E70F72]"
            style={{ width: `${barPct}%` }}
          />
        ) : (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#E70F72]"
            style={{ width: `${barPct}%` }}
          />
        )}
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-white/35 text-xs">{letter} · {barPct}% · {getStrengthLabel(barPct)}</span>
      </div>
    </div>
  );
}

export default function PersonalityStrengthBar({ mbtiType, quizResults }) {
  if (!quizResults || Object.keys(quizResults).length === 0) return null;

  const answers = quizResults;
  const totalAnswered = Object.keys(answers).length;
  const stage = totalAnswered >= 24 ? `Full (${totalAnswered}Q)` : `Core (${totalAnswered}Q)`;

  // Determine winning letter per dimension
  const [letter0, letter1, letter2, letter3] = mbtiType.split('');

  // Calculate % toward the winning letter
  const eiPct = calcDimensionStrength(answers, 'EI', letter0);
  const snPct = calcDimensionStrength(answers, 'SN', letter1);
  const tfPct = calcDimensionStrength(answers, 'TF', letter2);
  const jpPct = calcDimensionStrength(answers, 'JP', letter3);

  // Overall confidence = average of available dimension percentages
  const available = [eiPct, snPct, tfPct, jpPct].filter(v => v !== null);
  const overallConfidence = available.length ? Math.round(available.reduce((a, b) => a + b, 0) / available.length) : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">
      <h3 className="text-white font-bold text-lg mb-1">Personality Strength</h3>
      <p className="text-white/40 text-sm mb-6">
        Stage: {stage} · Overall confidence{' '}
        <span className="text-white font-bold">{overallConfidence}%</span>
      </p>

      {eiPct !== null && (
        <DimensionRow
          leftLabel="Extraverted"
          rightLabel="Introverted"
          letter={letter0}
          pct={eiPct}
          pointsRight={letter0 === 'I'}
        />
      )}
      {snPct !== null && (
        <DimensionRow
          leftLabel="Sensing"
          rightLabel="Intuitive"
          letter={letter1}
          pct={snPct}
          pointsRight={letter1 === 'N'}
        />
      )}
      {tfPct !== null && (
        <DimensionRow
          leftLabel="Thinking"
          rightLabel="Feeling"
          letter={letter2}
          pct={tfPct}
          pointsRight={letter2 === 'F'}
        />
      )}
      {jpPct !== null && (
        <DimensionRow
          leftLabel="Judging"
          rightLabel="Perceiving"
          letter={letter3}
          pct={jpPct}
          pointsRight={letter3 === 'P'}
        />
      )}
    </div>
  );
}