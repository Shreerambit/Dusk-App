import type { QuizQuestion, WhoQuestion } from '@/lib/types'

/** "How well do you know each other?" — both partners answer independently on one device. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', topic: 'interests', prompt: 'What is their ideal way to spend a free Saturday?', options: ['Somewhere outdoors', 'Slow morning at home', 'Out with friends', 'A project or hobby'] },
  { id: 'q2', topic: 'compatibility', prompt: 'Which holiday would they choose right now?', options: ['Beach and nothing else', 'City with museums and food', 'Mountains and hiking', 'Road trip, no fixed plan'] },
  { id: 'q3', topic: 'differences', prompt: 'How do they prefer to resolve a disagreement?', options: ['Talk it out immediately', 'Take a pause, come back later', 'Write it down first', 'Lighten it with humour'] },
  { id: 'q4', topic: 'memories', prompt: 'What do they remember most fondly about your first month together?', options: ['A specific conversation', 'A place you went', 'A song or film', 'The nerves of it all'] },
  { id: 'q5', topic: 'goals', prompt: 'What would they most want to change about the next year?', options: ['More travel', 'More calm', 'More creative time', 'More financial breathing room'] },
  { id: 'q6', topic: 'interests', prompt: 'Their comfort meal is closest to…', options: ['Something carb-heavy', 'Something spicy', 'Something from childhood', 'Dessert, honestly'] },
  { id: 'q7', topic: 'compatibility', prompt: 'Which evening sounds better to them tonight?', options: ['Dinner out', 'Film on the sofa', 'A long walk', 'Seeing people'] },
  { id: 'q8', topic: 'differences', prompt: 'How do they recharge after a hard week?', options: ['Alone and quiet', 'With people', 'Exercise or moving', 'Screens and snacks'] },
  { id: 'q9', topic: 'memories', prompt: 'What was their honest first impression of you?', options: ['Instantly interested', 'Intrigued but unsure', 'Nervous', 'Did not think much of it yet'] },
  { id: 'q10', topic: 'goals', prompt: 'What would they most like to learn together?', options: ['A language', 'Cooking properly', 'A sport or dance', 'Something musical'] },
  { id: 'q11', topic: 'interests', prompt: 'Which would they save up for first?', options: ['A trip', 'A home upgrade', 'An experience or event', 'Nothing, just security'] },
  { id: 'q12', topic: 'compatibility', prompt: 'What makes them feel most appreciated?', options: ['Being told directly', 'Time and attention', 'Practical help', 'Small surprises'] },
  { id: 'q13', topic: 'differences', prompt: 'How do they feel about surprise plans?', options: ['Love them', 'Like them with warning', 'Prefer to know everything', 'Depends on the week'] },
  { id: 'q14', topic: 'memories', prompt: 'Which shared memory would they pick as the favourite?', options: ['A trip', 'An ordinary perfect day', 'A celebration', 'Something that went wrong and became funny'] },
  { id: 'q15', topic: 'goals', prompt: 'Five years from now they most hope to have…', options: ['Somewhere settled', 'Freedom to move', 'A creative project going', 'More time together'] },
]

export const WHO_QUESTIONS: WhoQuestion[] = [
  { id: 'w1', prompt: 'Who is more likely to travel spontaneously?' },
  { id: 'w2', prompt: 'Who apologises first?' },
  { id: 'w3', prompt: 'Who takes longer to get ready?' },
  { id: 'w4', prompt: 'Who is more adventurous?' },
  { id: 'w5', prompt: 'Who remembers important dates better?' },
  { id: 'w6', prompt: 'Who would survive longer without a phone?' },
  { id: 'w7', prompt: 'Who is the better driver, honestly?' },
  { id: 'w8', prompt: 'Who is more likely to cry at a film?' },
  { id: 'w9', prompt: 'Who makes the better coffee?' },
  { id: 'w10', prompt: 'Who is more likely to talk to a stranger?' },
  { id: 'w11', prompt: 'Who is messier?' },
  { id: 'w12', prompt: 'Who would win an argument about directions?' },
  { id: 'w13', prompt: 'Who falls asleep first?' },
  { id: 'w14', prompt: 'Who is more likely to plan a surprise?' },
  { id: 'w15', prompt: 'Who is more competitive?' },
  { id: 'w16', prompt: 'Who is better with money?' },
  { id: 'w17', prompt: 'Who would last longer on a hike?' },
  { id: 'w18', prompt: 'Who tells the better story at a party?' },
  { id: 'w19', prompt: 'Who is more likely to try the strange item on the menu?' },
  { id: 'w20', prompt: 'Who checks the weather more?' },
  { id: 'w21', prompt: 'Who sends the first text after a disagreement?' },
  { id: 'w22', prompt: 'Who is more likely to keep a plant alive?' },
  { id: 'w23', prompt: 'Who has better taste in music?' },
  { id: 'w24', prompt: 'Who would be calmer in an emergency?' },
]

/** Daily challenges rotate deterministically by date so both partners see the same one. */
export const DAILY_CHALLENGES = [
  { title: 'Compliment Challenge', text: 'Give three specific compliments today. Not about appearance — about something they did.' },
  { title: 'No-Phone Dinner', text: 'Eat one meal today with both phones in another room. Talk about anything except logistics.' },
  { title: 'Memory Challenge', text: 'Each recall a shared memory the other has probably forgotten. Tell it in full.' },
  { title: 'Small Surprise', text: 'Do one unrequested small thing for your partner today. Do not announce it.' },
  { title: 'Try Something New', text: 'Do one thing today neither of you has done before, however small.' },
  { title: 'Write a Note', text: 'Leave a handwritten note somewhere they will find it tomorrow.' },
  { title: 'Spontaneous Photo', text: 'Take one unplanned photo together today and keep it, even if it is awful.' },
  { title: 'Ten Minute Check-In', text: 'Ten minutes, no screens: how are you actually doing this week?' },
  { title: 'Gratitude Round', text: 'Each name three things you are grateful for right now, one of which is about the other.' },
  { title: 'The Long Hug', text: 'One hug today lasting a full minute. It resets more than you would expect.' },
  { title: 'Ask a Real Question', text: 'Ask one question you have never asked them before, and listen to the whole answer.' },
  { title: 'Plan Something Together', text: 'Spend fifteen minutes planning something to look forward to, even a small thing.' },
  { title: 'Song Dedication', text: 'Send each other one song today with a one-line reason.' },
  { title: 'Take Over a Chore', text: 'Quietly take over one task your partner normally does today.' },
]

export const BADGES = [
  { id: 'first-date', label: 'First Date', desc: 'Complete your first activity together.', check: (s: { completed: number }) => s.completed >= 1 },
  { id: 'game-night', label: 'Game Night', desc: 'Complete 3 couple games.', check: (s: { games: number }) => s.games >= 3 },
  { id: 'adventure-couple', label: 'Adventure Couple', desc: 'Complete 5 adventure activities.', check: (s: { adventures: number }) => s.adventures >= 5 },
  { id: 'connection-7', label: '7-Day Connection', desc: 'Keep a 7-day streak going.', check: (s: { streak: number }) => s.streak >= 7 },
  { id: 'explorer', label: 'Explorer', desc: 'Complete activities in 5 different categories.', check: (s: { categories: number }) => s.categories >= 5 },
  { id: 'memory-maker', label: 'Memory Maker', desc: 'Write 3 private notes in your journey.', check: (s: { notes: number }) => s.notes >= 3 },
  { id: 'curator', label: 'Curator', desc: 'Save 10 ideas for later.', check: (s: { saved: number }) => s.saved >= 10 },
  { id: 'night-owl', label: 'Night Owl', desc: 'Spin the wheel 25 times.', check: (s: { spins: number }) => s.spins >= 25 },
] as const
