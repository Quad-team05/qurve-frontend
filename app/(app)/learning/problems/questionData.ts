export type ProblemQuestion = {
  prompt: string;
  sentence: string;
  options: string[];
  correctIndex: number;
  explanationTitle: string;
  explanationOptions: string[];
};

export const PROBLEM_QUESTIONS: ProblemQuestion[] = [
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '彼女は毎朝新聞を読みます。',
    options: ['1. しんもん', '2. しんぶん', '3. せんもん', '4. にゅうもん'],
    correctIndex: 1,
    explanationTitle: '新聞의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 신문', '2. 심문', '3. 선문', '4. 입문'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '今日は図書館で勉強します。',
    options: ['1. としょかん', '2. ずしょかん', '3. とそうかん', '4. ずそうかん'],
    correctIndex: 0,
    explanationTitle: '図書館의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 도서관', '2. 도서감', '3. 도총관', '4. 도상관'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '来週、友達と映画を見ます。',
    options: ['1. えいか', '2. えが', '3. えいが', '4. えがい'],
    correctIndex: 2,
    explanationTitle: '映画의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 영화', '2. 영가', '3. 영예', '4. 영상'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '母は毎日料理を作ります。',
    options: ['1. りょり', '2. りょうり', '3. りょあり', '4. りょうい'],
    correctIndex: 1,
    explanationTitle: '料理의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 요리', '2. 용의', '3. 요이', '4. 료아리'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '駅まで歩いて行きます。',
    options: ['1. えき', '2. えぎ', '3. えこ', '4. えく'],
    correctIndex: 0,
    explanationTitle: '駅의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 역', '2. 액', '3. 익', '4. 엣'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '昨日、先生に質問しました。',
    options: ['1. しつもん', '2. しちもん', '3. しっもん', '4. しつぼん'],
    correctIndex: 0,
    explanationTitle: '質問의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 질문', '2. 질몬', '3. 질문(장문)', '4. 실문'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '週末は家族と買い物に行きます。',
    options: ['1. かいぶつ', '2. かいもの', '3. かいもつ', '4. がいもの'],
    correctIndex: 1,
    explanationTitle: '買い物의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 쇼핑', '2. 괴물', '3. 개물', '4. 가이모노'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '電車で会社へ通っています。',
    options: ['1. でんしゃ', '2. てんしゃ', '3. でんさ', '4. てんさ'],
    correctIndex: 0,
    explanationTitle: '電車의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 전차', '2. 천사', '3. 덴사', '4. 덴샤(오독)'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '朝ご飯を食べました。',
    options: ['1. あさごぱん', '2. あさごはん', '3. あさはん', '4. あさごばん'],
    correctIndex: 1,
    explanationTitle: '朝ご飯의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 아침밥', '2. 아침빵', '3. 아사한', '4. 아사고반'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '明日は病院へ行く予定です。',
    options: ['1. びょいん', '2. びょういん', '3. ひょういん', '4. びょおいん'],
    correctIndex: 1,
    explanationTitle: '病院의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 병원', '2. 병인', '3. 표인', '4. 비요인'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '新しい辞書を買いました。',
    options: ['1. じしょ', '2. じしょう', '3. ちしょ', '4. じそ'],
    correctIndex: 0,
    explanationTitle: '辞書의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 사전', '2. 지쇼', '3. 치서', '4. 지소'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '家で日本語を練習しています。',
    options: ['1. れんしゅう', '2. れんしゅ', '3. れいしゅう', '4. れんしょう'],
    correctIndex: 0,
    explanationTitle: '練習의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 연습', '2. 렌슈', '3. 영수', '4. 연상'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '空港までバスで行きます。',
    options: ['1. くうこう', '2. こうくう', '3. くこう', '4. くうごう'],
    correctIndex: 0,
    explanationTitle: '空港의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 공항', '2. 항공', '3. 구항', '4. 쿠고'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '今日は天気がいいですね。',
    options: ['1. てんき', '2. ていき', '3. でんき', '4. てんぎ'],
    correctIndex: 0,
    explanationTitle: '天気의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 날씨', '2. 전기', '3. 텐기', '4. 덴키'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '毎晩音楽を聞いています。',
    options: ['1. おんかく', '2. おんがく', '3. おうがく', '4. おんらく'],
    correctIndex: 1,
    explanationTitle: '音楽의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 음악', '2. 음각', '3. 왕학', '4. 온락'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '来月、京都へ旅行します。',
    options: ['1. りょうこう', '2. りょこう', '3. りょうごう', '4. りょごう'],
    correctIndex: 1,
    explanationTitle: '旅行의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 여행', '2. 양행', '3. 려행', '4. 료고'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '教室で友達と話しました。',
    options: ['1. きょうしつ', '2. きょしつ', '3. きょうじつ', '4. きょじつ'],
    correctIndex: 0,
    explanationTitle: '教室의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 교실', '2. 교절', '3. 경실', '4. 교수'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '昼ご飯はカレーを食べました。',
    options: ['1. ひるごばん', '2. ひるごはん', '3. ひるはん', '4. ひろごはん'],
    correctIndex: 1,
    explanationTitle: '昼ご飯의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 점심밥', '2. 저녁밥', '3. 히루한', '4. 히로고한'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '先生の説明は分かりやすいです。',
    options: ['1. せつめ', '2. せつめい', '3. せつまい', '4. せいめい'],
    correctIndex: 1,
    explanationTitle: '説明의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 설명', '2. 설매', '3. 성명', '4. 절명'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '図書館で本を借りました。',
    options: ['1. かりました', '2. からりました', '3. かえりました', '4. かりまた'],
    correctIndex: 0,
    explanationTitle: '借りました의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 빌렸습니다', '2. 돌아왔습니다', '3. 갈아탔습니다', '4. 갔습니다'],
  },
];

export const TOTAL_PROBLEM_COUNT = PROBLEM_QUESTIONS.length;

export const parseAnswersParam = (answersParam: string | string[] | undefined) => {
  const answerString = Array.isArray(answersParam) ? answersParam[0] : answersParam;
  if (!answerString) {
    return Array.from({ length: TOTAL_PROBLEM_COUNT }, () => null) as (number | null)[];
  }

  const parsed = answerString
    .split(',')
    .map((value) => {
      const num = Number(value);
      return Number.isFinite(num) && num >= 0 ? num : null;
    })
    .slice(0, TOTAL_PROBLEM_COUNT);

  if (parsed.length < TOTAL_PROBLEM_COUNT) {
    parsed.push(...Array.from({ length: TOTAL_PROBLEM_COUNT - parsed.length }, () => null));
  }

  return parsed;
};

export const serializeAnswers = (answers: (number | null)[]) =>
  answers.map((answer) => (answer === null ? -1 : answer)).join(',');

export const countCorrectAnswers = (answers: (number | null)[]) =>
  PROBLEM_QUESTIONS.reduce((count, question, index) => {
    if (answers[index] === question.correctIndex) {
      return count + 1;
    }
    return count;
  }, 0);
