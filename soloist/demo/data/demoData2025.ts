/**
 * Pre-generated Demo Data for 2025
 * Static data that gets loaded into the demo app
 */

export interface DemoLogEntry {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  timestamp: number;
}

export interface DemoLogData {
  _id: string;
  _creationTime: number;
  userId: string;
  date: string; // YYYY-MM-DD
  entries: DemoLogEntry[];
}

// Helper to generate consistent IDs
const generateId = (seed: string) => `demo_${seed}`;

// Helper to create a date timestamp
const getDateTimestamp = (dateStr: string, hourOffset: number = 0) => {
  const date = new Date(dateStr);
  date.setHours(hourOffset);
  return date.getTime();
};

export const DEMO_DATA_2025: DemoLogData[] = [
  // January 2025
  { _id: generateId('2025-01-02'), _creationTime: getDateTimestamp('2025-01-02'), userId: 'demo-user', date: '2025-01-02', entries: [
    { id: generateId('2025-01-02-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Started the day with 20 minutes of meditation and yoga. Feeling centered and ready.', timestamp: getDateTimestamp('2025-01-02', 7) },
    { id: generateId('2025-01-02-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Deep work session on main project. Made significant progress on core features.', timestamp: getDateTimestamp('2025-01-02', 10) },
    { id: generateId('2025-01-02-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Productive day overall. Completed 3 major tasks and made good progress.', timestamp: getDateTimestamp('2025-01-02', 20) }
  ]},
  { _id: generateId('2025-01-03'), _creationTime: getDateTimestamp('2025-01-03'), userId: 'demo-user', date: '2025-01-03', entries: [
    { id: generateId('2025-01-03-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning run at sunrise, 5k in 28 minutes. Energy levels high!', timestamp: getDateTimestamp('2025-01-03', 6) },
    { id: generateId('2025-01-03-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Team meeting went well. Good collaboration and creative ideas flowing.', timestamp: getDateTimestamp('2025-01-03', 11) },
    { id: generateId('2025-01-03-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling energized and optimistic about upcoming opportunities.', timestamp: getDateTimestamp('2025-01-03', 15) }
  ]},
  { _id: generateId('2025-01-06'), _creationTime: getDateTimestamp('2025-01-06'), userId: 'demo-user', date: '2025-01-06', entries: [
    { id: generateId('2025-01-06-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Quick breakfast and reviewed goals for the day. Excited about new project.', timestamp: getDateTimestamp('2025-01-06', 7) },
    { id: generateId('2025-01-06-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Completed code review. Found and fixed several edge cases.', timestamp: getDateTimestamp('2025-01-06', 13) },
    { id: generateId('2025-01-06-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Great day! Everything clicked and I was in a flow state.', timestamp: getDateTimestamp('2025-01-06', 21) }
  ]},
  { _id: generateId('2025-01-07'), _creationTime: getDateTimestamp('2025-01-07'), userId: 'demo-user', date: '2025-01-07', entries: [
    { id: generateId('2025-01-07-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Slept in a bit, but did 15 minutes of stretching. Sometimes rest is needed.', timestamp: getDateTimestamp('2025-01-07', 8) },
    { id: generateId('2025-01-07-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Client presentation was a success! They loved the proposal.', timestamp: getDateTimestamp('2025-01-07', 14) }
  ]},
  { _id: generateId('2025-01-08'), _creationTime: getDateTimestamp('2025-01-08'), userId: 'demo-user', date: '2025-01-08', entries: [
    { id: generateId('2025-01-08-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Early start with coffee and journaling. Clarified priorities.', timestamp: getDateTimestamp('2025-01-08', 6) },
    { id: generateId('2025-01-08-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Focused on debugging. Finally solved that tricky issue.', timestamp: getDateTimestamp('2025-01-08', 10) },
    { id: generateId('2025-01-08-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'A bit stressed with deadlines, but managing it well.', timestamp: getDateTimestamp('2025-01-08', 16) },
    { id: generateId('2025-01-08-4'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Felt a bit overwhelmed mid-day, but finished strong. Learning to pace myself.', timestamp: getDateTimestamp('2025-01-08', 20) }
  ]},
  { _id: generateId('2025-01-09'), _creationTime: getDateTimestamp('2025-01-09'), userId: 'demo-user', date: '2025-01-09', entries: [
    { id: generateId('2025-01-09-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning walk with dog. Fresh air cleared my mind.', timestamp: getDateTimestamp('2025-01-09', 7) },
    { id: generateId('2025-01-09-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Planning session for next quarter. Exciting roadmap ahead.', timestamp: getDateTimestamp('2025-01-09', 11) },
    { id: generateId('2025-01-09-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Mixed results today. Some wins, some setbacks. That\'s life.', timestamp: getDateTimestamp('2025-01-09', 19) }
  ]},
  { _id: generateId('2025-01-10'), _creationTime: getDateTimestamp('2025-01-10'), userId: 'demo-user', date: '2025-01-10', entries: [
    { id: generateId('2025-01-10-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Gym session: weights and cardio. Pushing personal records.', timestamp: getDateTimestamp('2025-01-10', 6) },
    { id: generateId('2025-01-10-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Mentored junior team member. Rewarding to see their growth.', timestamp: getDateTimestamp('2025-01-10', 14) }
  ]},
  { _id: generateId('2025-01-13'), _creationTime: getDateTimestamp('2025-01-13'), userId: 'demo-user', date: '2025-01-13', entries: [
    { id: generateId('2025-01-13-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Peaceful morning with tea and reading. Setting positive intentions.', timestamp: getDateTimestamp('2025-01-13', 7) },
    { id: generateId('2025-01-13-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Research day: explored new technologies and best practices.', timestamp: getDateTimestamp('2025-01-13', 10) },
    { id: generateId('2025-01-13-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Calm and focused. Meditation practice is really helping.', timestamp: getDateTimestamp('2025-01-13', 15) },
    { id: generateId('2025-01-13-4'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Really proud of what I accomplished. Celebrating small wins.', timestamp: getDateTimestamp('2025-01-13', 21) }
  ]},
  { _id: generateId('2025-01-14'), _creationTime: getDateTimestamp('2025-01-14'), userId: 'demo-user', date: '2025-01-14', entries: [
    { id: generateId('2025-01-14-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Started the day with 20 minutes of meditation and yoga. Feeling centered and ready.', timestamp: getDateTimestamp('2025-01-14', 7) },
    { id: generateId('2025-01-14-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Sprint retrospective. Team is improving communication.', timestamp: getDateTimestamp('2025-01-14', 12) }
  ]},
  { _id: generateId('2025-01-15'), _creationTime: getDateTimestamp('2025-01-15'), userId: 'demo-user', date: '2025-01-15', entries: [
    { id: generateId('2025-01-15-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning run at sunrise, 5k in 28 minutes. Energy levels high!', timestamp: getDateTimestamp('2025-01-15', 6) },
    { id: generateId('2025-01-15-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Documentation day. Important but often overlooked work.', timestamp: getDateTimestamp('2025-01-15', 11) },
    { id: generateId('2025-01-15-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Tired but satisfied. Sometimes the hard days are the most rewarding.', timestamp: getDateTimestamp('2025-01-15', 20) }
  ]},

  // More January
  { _id: generateId('2025-01-16'), _creationTime: getDateTimestamp('2025-01-16'), userId: 'demo-user', date: '2025-01-16', entries: [
    { id: generateId('2025-01-16-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Slow morning, took time to enjoy breakfast and plan the day.', timestamp: getDateTimestamp('2025-01-16', 8) },
    { id: generateId('2025-01-16-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Struggled with focus today. Need to reassess priorities.', timestamp: getDateTimestamp('2025-01-16', 21) }
  ]},
  { _id: generateId('2025-01-17'), _creationTime: getDateTimestamp('2025-01-17'), userId: 'demo-user', date: '2025-01-17', entries: [
    { id: generateId('2025-01-17-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Tackled the hardest task first thing. Momentum carried through the day.', timestamp: getDateTimestamp('2025-01-17', 9) },
    { id: generateId('2025-01-17-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling accomplished and energized. This is what flow state feels like.', timestamp: getDateTimestamp('2025-01-17', 15) }
  ]},
  { _id: generateId('2025-01-20'), _creationTime: getDateTimestamp('2025-01-20'), userId: 'demo-user', date: '2025-01-20', entries: [
    { id: generateId('2025-01-20-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Meditation session. Feeling grateful for another week.', timestamp: getDateTimestamp('2025-01-20', 7) },
    { id: generateId('2025-01-20-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Weekly planning. Set clear goals and boundaries.', timestamp: getDateTimestamp('2025-01-20', 10) }
  ]},
  { _id: generateId('2025-01-21'), _creationTime: getDateTimestamp('2025-01-21'), userId: 'demo-user', date: '2025-01-21', entries: [
    { id: generateId('2025-01-21-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Quick workout. Body is getting stronger.', timestamp: getDateTimestamp('2025-01-21', 6) },
    { id: generateId('2025-01-21-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Collaborative session with team. Great ideas emerged.', timestamp: getDateTimestamp('2025-01-21', 11) },
    { id: generateId('2025-01-21-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Good progress on project. Feeling positive about the direction.', timestamp: getDateTimestamp('2025-01-21', 20) }
  ]},
  { _id: generateId('2025-01-22'), _creationTime: getDateTimestamp('2025-01-22'), userId: 'demo-user', date: '2025-01-22', entries: [
    { id: generateId('2025-01-22-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Deep focus session. Made breakthrough on technical challenge.', timestamp: getDateTimestamp('2025-01-22', 10) },
    { id: generateId('2025-01-22-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Excited about solving hard problems. This is why I love this work.', timestamp: getDateTimestamp('2025-01-22', 16) }
  ]},
  { _id: generateId('2025-01-23'), _creationTime: getDateTimestamp('2025-01-23'), userId: 'demo-user', date: '2025-01-23', entries: [
    { id: generateId('2025-01-23-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Coffee and journaling. Reflecting on wins this month.', timestamp: getDateTimestamp('2025-01-23', 7) },
    { id: generateId('2025-01-23-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Balanced day. Work and life feel integrated.', timestamp: getDateTimestamp('2025-01-23', 21) }
  ]},
  { _id: generateId('2025-01-24'), _creationTime: getDateTimestamp('2025-01-24'), userId: 'demo-user', date: '2025-01-24', entries: [
    { id: generateId('2025-01-24-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Early start. Ready to wrap up the week strong.', timestamp: getDateTimestamp('2025-01-24', 6) },
    { id: generateId('2025-01-24-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Finished three major tasks. Momentum is building.', timestamp: getDateTimestamp('2025-01-24', 14) }
  ]},
  { _id: generateId('2025-01-27'), _creationTime: getDateTimestamp('2025-01-27'), userId: 'demo-user', date: '2025-01-27', entries: [
    { id: generateId('2025-01-27-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'New week energy. Set ambitious but achievable goals.', timestamp: getDateTimestamp('2025-01-27', 7) },
    { id: generateId('2025-01-27-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Project kickoff meeting. Team is aligned and excited.', timestamp: getDateTimestamp('2025-01-27', 11) },
    { id: generateId('2025-01-27-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Strong start to the week. Building on last week\'s momentum.', timestamp: getDateTimestamp('2025-01-27', 20) }
  ]},
  { _id: generateId('2025-01-28'), _creationTime: getDateTimestamp('2025-01-28'), userId: 'demo-user', date: '2025-01-28', entries: [
    { id: generateId('2025-01-28-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Productive coding session. Features coming together nicely.', timestamp: getDateTimestamp('2025-01-28', 10) },
    { id: generateId('2025-01-28-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling capable and confident. Good headspace.', timestamp: getDateTimestamp('2025-01-28', 15) }
  ]},
  { _id: generateId('2025-01-29'), _creationTime: getDateTimestamp('2025-01-29'), userId: 'demo-user', date: '2025-01-29', entries: [
    { id: generateId('2025-01-29-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Yoga and stretching. Mind and body connection.', timestamp: getDateTimestamp('2025-01-29', 7) },
    { id: generateId('2025-01-29-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Steady progress. Not every day needs to be epic.', timestamp: getDateTimestamp('2025-01-29', 21) }
  ]},
  { _id: generateId('2025-01-30'), _creationTime: getDateTimestamp('2025-01-30'), userId: 'demo-user', date: '2025-01-30', entries: [
    { id: generateId('2025-01-30-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Wrapping up January deliverables. On track with goals.', timestamp: getDateTimestamp('2025-01-30', 11) }
  ]},
  { _id: generateId('2025-01-31'), _creationTime: getDateTimestamp('2025-01-31'), userId: 'demo-user', date: '2025-01-31', entries: [
    { id: generateId('2025-01-31-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Last day of January. Reflecting on the month\'s journey.', timestamp: getDateTimestamp('2025-01-31', 7) },
    { id: generateId('2025-01-31-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Proud of what I accomplished this month. Ready for February.', timestamp: getDateTimestamp('2025-01-31', 20) }
  ]},

  // Continue with more dates throughout 2025...
  // February
  { _id: generateId('2025-02-01'), _creationTime: getDateTimestamp('2025-02-01'), userId: 'demo-user', date: '2025-02-01', entries: [
    { id: generateId('2025-02-01-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Fresh month, fresh mindset. February goals set.', timestamp: getDateTimestamp('2025-02-01', 7) },
    { id: generateId('2025-02-01-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Sprint planning. New features on the roadmap.', timestamp: getDateTimestamp('2025-02-01', 10) }
  ]},
  { _id: generateId('2025-02-03'), _creationTime: getDateTimestamp('2025-02-03'), userId: 'demo-user', date: '2025-02-03', entries: [
    { id: generateId('2025-02-03-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Quick breakfast and reviewed goals for the day. Excited about new project.', timestamp: getDateTimestamp('2025-02-03', 7) },
    { id: generateId('2025-02-03-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Deep work session on main project. Made significant progress on core features.', timestamp: getDateTimestamp('2025-02-03', 10) },
    { id: generateId('2025-02-03-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Excited about new project launch next week!', timestamp: getDateTimestamp('2025-02-03', 16) }
  ]},
  { _id: generateId('2025-02-04'), _creationTime: getDateTimestamp('2025-02-04'), userId: 'demo-user', date: '2025-02-04', entries: [
    { id: generateId('2025-02-04-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Code review and refactoring. Quality over speed.', timestamp: getDateTimestamp('2025-02-04', 11) },
    { id: generateId('2025-02-04-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Solid work today. Keeping the momentum going.', timestamp: getDateTimestamp('2025-02-04', 20) }
  ]},
  { _id: generateId('2025-02-05'), _creationTime: getDateTimestamp('2025-02-05'), userId: 'demo-user', date: '2025-02-05', entries: [
    { id: generateId('2025-02-05-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Early start with coffee and journaling. Clarified priorities.', timestamp: getDateTimestamp('2025-02-05', 6) },
    { id: generateId('2025-02-05-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Team meeting went well. Good collaboration and creative ideas flowing.', timestamp: getDateTimestamp('2025-02-05', 11) },
    { id: generateId('2025-02-05-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Good balance today between work and personal time. Need more days like this.', timestamp: getDateTimestamp('2025-02-05', 21) }
  ]},
  { _id: generateId('2025-02-06'), _creationTime: getDateTimestamp('2025-02-06'), userId: 'demo-user', date: '2025-02-06', entries: [
    { id: generateId('2025-02-06-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Gym session before work. Endorphins are real.', timestamp: getDateTimestamp('2025-02-06', 6) },
    { id: generateId('2025-02-06-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Productive pair programming session. Learning from teammates.', timestamp: getDateTimestamp('2025-02-06', 13) }
  ]},
  { _id: generateId('2025-02-07'), _creationTime: getDateTimestamp('2025-02-07'), userId: 'demo-user', date: '2025-02-07', entries: [
    { id: generateId('2025-02-07-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning walk with dog. Fresh air cleared my mind.', timestamp: getDateTimestamp('2025-02-07', 7) },
    { id: generateId('2025-02-07-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Completed code review. Found and fixed several edge cases.', timestamp: getDateTimestamp('2025-02-07', 13) }
  ]},
  { _id: generateId('2025-02-08'), _creationTime: getDateTimestamp('2025-02-08'), userId: 'demo-user', date: '2025-02-08', entries: [
    { id: generateId('2025-02-08-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Hit a wall on a technical problem. Stepping away to reset.', timestamp: getDateTimestamp('2025-02-08', 14) },
    { id: generateId('2025-02-08-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Tough day. Reminded that struggle is part of growth.', timestamp: getDateTimestamp('2025-02-08', 21) }
  ]},
  { _id: generateId('2025-02-10'), _creationTime: getDateTimestamp('2025-02-10'), userId: 'demo-user', date: '2025-02-10', entries: [
    { id: generateId('2025-02-10-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Meditation helped clear yesterday\'s frustration.', timestamp: getDateTimestamp('2025-02-10', 7) },
    { id: generateId('2025-02-10-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Breakthrough! Yesterday\'s problem solved with fresh perspective.', timestamp: getDateTimestamp('2025-02-10', 11) },
    { id: generateId('2025-02-10-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'This is why persistence matters. Grateful for the struggle.', timestamp: getDateTimestamp('2025-02-10', 20) }
  ]},
  { _id: generateId('2025-02-11'), _creationTime: getDateTimestamp('2025-02-11'), userId: 'demo-user', date: '2025-02-11', entries: [
    { id: generateId('2025-02-11-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Building on yesterday\'s momentum. Features coming together.', timestamp: getDateTimestamp('2025-02-11', 10) },
    { id: generateId('2025-02-11-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling strong and capable. Back in my element.', timestamp: getDateTimestamp('2025-02-11', 15) }
  ]},
  { _id: generateId('2025-02-12'), _creationTime: getDateTimestamp('2025-02-12'), userId: 'demo-user', date: '2025-02-12', entries: [
    { id: generateId('2025-02-12-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Peaceful morning with tea and reading. Setting positive intentions.', timestamp: getDateTimestamp('2025-02-12', 7) },
    { id: generateId('2025-02-12-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Focused on debugging. Finally solved that tricky issue.', timestamp: getDateTimestamp('2025-02-12', 10) },
    { id: generateId('2025-02-12-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Great day! Everything clicked and I was in a flow state.', timestamp: getDateTimestamp('2025-02-12', 21) }
  ]},
  { _id: generateId('2025-02-13'), _creationTime: getDateTimestamp('2025-02-13'), userId: 'demo-user', date: '2025-02-13', entries: [
    { id: generateId('2025-02-13-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Great energy today. Ready to tackle challenges.', timestamp: getDateTimestamp('2025-02-13', 7) },
    { id: generateId('2025-02-13-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Sprint review went excellent. Stakeholders impressed.', timestamp: getDateTimestamp('2025-02-13', 14) }
  ]},
  { _id: generateId('2025-02-14'), _creationTime: getDateTimestamp('2025-02-14'), userId: 'demo-user', date: '2025-02-14', entries: [
    { id: generateId('2025-02-14-1'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling grateful and connected. Valentine\'s vibes.', timestamp: getDateTimestamp('2025-02-14', 15) },
    { id: generateId('2025-02-14-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Nice balance of work and personal joy today.', timestamp: getDateTimestamp('2025-02-14', 20) }
  ]},
  { _id: generateId('2025-02-17'), _creationTime: getDateTimestamp('2025-02-17'), userId: 'demo-user', date: '2025-02-17', entries: [
    { id: generateId('2025-02-17-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Monday energy. New week, new opportunities.', timestamp: getDateTimestamp('2025-02-17', 7) },
    { id: generateId('2025-02-17-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Planning next sprint. Clear priorities set.', timestamp: getDateTimestamp('2025-02-17', 11) }
  ]},
  { _id: generateId('2025-02-18'), _creationTime: getDateTimestamp('2025-02-18'), userId: 'demo-user', date: '2025-02-18', entries: [
    { id: generateId('2025-02-18-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Implementing new features. Code flowing well.', timestamp: getDateTimestamp('2025-02-18', 10) },
    { id: generateId('2025-02-18-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Strong progress. Momentum building nicely.', timestamp: getDateTimestamp('2025-02-18', 21) }
  ]},
  { _id: generateId('2025-02-19'), _creationTime: getDateTimestamp('2025-02-19'), userId: 'demo-user', date: '2025-02-19', entries: [
    { id: generateId('2025-02-19-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Early workout. Endorphins are carrying me through.', timestamp: getDateTimestamp('2025-02-19', 6) },
    { id: generateId('2025-02-19-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Collaborative problem solving. Team synergy is strong.', timestamp: getDateTimestamp('2025-02-19', 13) },
    { id: generateId('2025-02-19-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling capable and energized. In my element.', timestamp: getDateTimestamp('2025-02-19', 16) }
  ]},
  { _id: generateId('2025-02-20'), _creationTime: getDateTimestamp('2025-02-20'), userId: 'demo-user', date: '2025-02-20', entries: [
    { id: generateId('2025-02-20-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Major milestone reached! Celebrating with the team.', timestamp: getDateTimestamp('2025-02-20', 14) },
    { id: generateId('2025-02-20-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Proud of what we accomplished. Great teamwork.', timestamp: getDateTimestamp('2025-02-20', 20) }
  ]},
  { _id: generateId('2025-02-21'), _creationTime: getDateTimestamp('2025-02-21'), userId: 'demo-user', date: '2025-02-21', entries: [
    { id: generateId('2025-02-21-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Reflecting on wins, planning next phase.', timestamp: getDateTimestamp('2025-02-21', 7) },
    { id: generateId('2025-02-21-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Wrapping up February strong. Ready for March.', timestamp: getDateTimestamp('2025-02-21', 21) }
  ]},

  // March
  { _id: generateId('2025-03-01'), _creationTime: getDateTimestamp('2025-03-01'), userId: 'demo-user', date: '2025-03-01', entries: [
    { id: generateId('2025-03-01-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Spring is coming. Fresh energy in the air.', timestamp: getDateTimestamp('2025-03-01', 7) },
    { id: generateId('2025-03-01-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'March goals set. Ambitious but achievable.', timestamp: getDateTimestamp('2025-03-01', 10) }
  ]},
  { _id: generateId('2025-03-03'), _creationTime: getDateTimestamp('2025-03-03'), userId: 'demo-user', date: '2025-03-03', entries: [
    { id: generateId('2025-03-03-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Started the day with 20 minutes of meditation and yoga. Feeling centered and ready.', timestamp: getDateTimestamp('2025-03-03', 7) },
    { id: generateId('2025-03-03-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Planning session for next quarter. Exciting roadmap ahead.', timestamp: getDateTimestamp('2025-03-03', 11) },
    { id: generateId('2025-03-03-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Struggled with focus, but did my best. Tomorrow is a new opportunity.', timestamp: getDateTimestamp('2025-03-03', 19) }
  ]},
  { _id: generateId('2025-03-04'), _creationTime: getDateTimestamp('2025-03-04'), userId: 'demo-user', date: '2025-03-04', entries: [
    { id: generateId('2025-03-04-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Deep focus achieved. Flow state for hours.', timestamp: getDateTimestamp('2025-03-04', 10) },
    { id: generateId('2025-03-04-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'This is what peak performance feels like. Grateful.', timestamp: getDateTimestamp('2025-03-04', 16) }
  ]},
  { _id: generateId('2025-03-05'), _creationTime: getDateTimestamp('2025-03-05'), userId: 'demo-user', date: '2025-03-05', entries: [
    { id: generateId('2025-03-05-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning run at sunrise, 5k in 28 minutes. Energy levels high!', timestamp: getDateTimestamp('2025-03-05', 6) },
    { id: generateId('2025-03-05-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Mentored junior team member. Rewarding to see their growth.', timestamp: getDateTimestamp('2025-03-05', 14) },
    { id: generateId('2025-03-05-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Slightly anxious about presentation, but prepared well.', timestamp: getDateTimestamp('2025-03-05', 15) }
  ]},
  { _id: generateId('2025-03-07'), _creationTime: getDateTimestamp('2025-03-07'), userId: 'demo-user', date: '2025-03-07', entries: [
    { id: generateId('2025-03-07-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Slept in a bit, but did 15 minutes of stretching. Sometimes rest is needed.', timestamp: getDateTimestamp('2025-03-07', 8) },
    { id: generateId('2025-03-07-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Research day: explored new technologies and best practices.', timestamp: getDateTimestamp('2025-03-07', 10) },
    { id: generateId('2025-03-07-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Connected with colleagues over lunch. Reminded me why I love this work.', timestamp: getDateTimestamp('2025-03-07', 20) }
  ]},
  { _id: generateId('2025-03-10'), _creationTime: getDateTimestamp('2025-03-10'), userId: 'demo-user', date: '2025-03-10', entries: [
    { id: generateId('2025-03-10-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Quick breakfast and reviewed goals for the day. Excited about new project.', timestamp: getDateTimestamp('2025-03-10', 7) },
    { id: generateId('2025-03-10-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Sprint retrospective. Team is improving communication.', timestamp: getDateTimestamp('2025-03-10', 12) },
    { id: generateId('2025-03-10-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Wrapped up early to spend time with family. Priorities in check.', timestamp: getDateTimestamp('2025-03-10', 18) }
  ]},
  { _id: generateId('2025-03-12'), _creationTime: getDateTimestamp('2025-03-12'), userId: 'demo-user', date: '2025-03-12', entries: [
    { id: generateId('2025-03-12-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Early start with coffee and journaling. Clarified priorities.', timestamp: getDateTimestamp('2025-03-12', 6) },
    { id: generateId('2025-03-12-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Documentation day. Important but often overlooked work.', timestamp: getDateTimestamp('2025-03-12', 11) },
    { id: generateId('2025-03-12-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Happy and content. Taking time to appreciate the journey.', timestamp: getDateTimestamp('2025-03-12', 16) }
  ]},
  { _id: generateId('2025-03-14'), _creationTime: getDateTimestamp('2025-03-14'), userId: 'demo-user', date: '2025-03-14', entries: [
    { id: generateId('2025-03-14-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Crushing it today. Peak productivity achieved.', timestamp: getDateTimestamp('2025-03-14', 10) },
    { id: generateId('2025-03-14-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'One of those days where everything just works.', timestamp: getDateTimestamp('2025-03-14', 21) }
  ]},
  { _id: generateId('2025-03-17'), _creationTime: getDateTimestamp('2025-03-17'), userId: 'demo-user', date: '2025-03-17', entries: [
    { id: generateId('2025-03-17-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'St Patrick\'s Day vibes. Feeling lucky and grateful.', timestamp: getDateTimestamp('2025-03-17', 7) },
    { id: generateId('2025-03-17-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Collaborative brainstorming. Innovation happens in teams.', timestamp: getDateTimestamp('2025-03-17', 13) }
  ]},

  // April - Spring energy peaks
  { _id: generateId('2025-04-01'), _creationTime: getDateTimestamp('2025-04-01'), userId: 'demo-user', date: '2025-04-01', entries: [
    { id: generateId('2025-04-01-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'April begins! Spring energy is real. Feeling alive.', timestamp: getDateTimestamp('2025-04-01', 7) },
    { id: generateId('2025-04-01-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'New month, new possibilities. Excited for Q2.', timestamp: getDateTimestamp('2025-04-01', 20) }
  ]},
  { _id: generateId('2025-04-07'), _creationTime: getDateTimestamp('2025-04-07'), userId: 'demo-user', date: '2025-04-07', entries: [
    { id: generateId('2025-04-07-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Major feature launch today. Team nailed it.', timestamp: getDateTimestamp('2025-04-07', 14) },
    { id: generateId('2025-04-07-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Pride and excitement. This is what we work for.', timestamp: getDateTimestamp('2025-04-07', 16) }
  ]},
  { _id: generateId('2025-04-15'), _creationTime: getDateTimestamp('2025-04-15'), userId: 'demo-user', date: '2025-04-15', entries: [
    { id: generateId('2025-04-15-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Mid-month check-in. Still on track with goals.', timestamp: getDateTimestamp('2025-04-15', 7) },
    { id: generateId('2025-04-15-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Consistent effort pays off. Small wins add up.', timestamp: getDateTimestamp('2025-04-15', 21) }
  ]},

  // May - Sustained high performance
  { _id: generateId('2025-05-05'), _creationTime: getDateTimestamp('2025-05-05'), userId: 'demo-user', date: '2025-05-05', entries: [
    { id: generateId('2025-05-05-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Flow state achieved early. Riding the wave.', timestamp: getDateTimestamp('2025-05-05', 9) },
    { id: generateId('2025-05-05-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Energized and focused. Peak performance mode.', timestamp: getDateTimestamp('2025-05-05', 15) }
  ]},
  { _id: generateId('2025-05-12'), _creationTime: getDateTimestamp('2025-05-12'), userId: 'demo-user', date: '2025-05-12', entries: [
    { id: generateId('2025-05-12-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Beautiful spring morning. Gratitude practice.', timestamp: getDateTimestamp('2025-05-12', 7) },
    { id: generateId('2025-05-12-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Life is good. Work is meaningful. Grateful.', timestamp: getDateTimestamp('2025-05-12', 20) }
  ]},
  { _id: generateId('2025-05-20'), _creationTime: getDateTimestamp('2025-05-20'), userId: 'demo-user', date: '2025-05-20', entries: [
    { id: generateId('2025-05-20-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Complex problem solved. Persistence wins.', timestamp: getDateTimestamp('2025-05-20', 11) },
    { id: generateId('2025-05-20-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling accomplished and capable.', timestamp: getDateTimestamp('2025-05-20', 16) }
  ]},

  // June - Some fatigue creeping in
  { _id: generateId('2025-06-03'), _creationTime: getDateTimestamp('2025-06-03'), userId: 'demo-user', date: '2025-06-03', entries: [
    { id: generateId('2025-06-03-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Slower start today. Listening to my body.', timestamp: getDateTimestamp('2025-06-03', 8) },
    { id: generateId('2025-06-03-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Not every day is peak performance. That\'s okay.', timestamp: getDateTimestamp('2025-06-03', 21) }
  ]},
  { _id: generateId('2025-06-10'), _creationTime: getDateTimestamp('2025-06-10'), userId: 'demo-user', date: '2025-06-10', entries: [
    { id: generateId('2025-06-10-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Pushing through mid-year fatigue. Discipline over motivation.', timestamp: getDateTimestamp('2025-06-10', 10) },
    { id: generateId('2025-06-10-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Energy lower but commitment strong.', timestamp: getDateTimestamp('2025-06-10', 15) }
  ]},
  { _id: generateId('2025-06-16'), _creationTime: getDateTimestamp('2025-06-16'), userId: 'demo-user', date: '2025-06-16', entries: [
    { id: generateId('2025-06-16-1'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Struggling a bit. Need to reassess and recharge.', timestamp: getDateTimestamp('2025-06-16', 21) }
  ]},

  // July - Recovery and vacation
  { _id: generateId('2025-07-01'), _creationTime: getDateTimestamp('2025-07-01'), userId: 'demo-user', date: '2025-07-01', entries: [
    { id: generateId('2025-07-01-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Second half of the year. Time to regroup.', timestamp: getDateTimestamp('2025-07-01', 7) }
  ]},
  { _id: generateId('2025-07-10'), _creationTime: getDateTimestamp('2025-07-10'), userId: 'demo-user', date: '2025-07-10', entries: [
    { id: generateId('2025-07-10-1'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Vacation mode. Relaxing and recharging.', timestamp: getDateTimestamp('2025-07-10', 14) }
  ]},
  { _id: generateId('2025-07-18'), _creationTime: getDateTimestamp('2025-07-18'), userId: 'demo-user', date: '2025-07-18', entries: [
    { id: generateId('2025-07-18-1'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Back from break. Feeling refreshed and ready.', timestamp: getDateTimestamp('2025-07-18', 20) }
  ]},

  // August - Rebuilding momentum
  { _id: generateId('2025-08-04'), _creationTime: getDateTimestamp('2025-08-04'), userId: 'demo-user', date: '2025-08-04', entries: [
    { id: generateId('2025-08-04-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Getting back into rhythm. Momentum returning.', timestamp: getDateTimestamp('2025-08-04', 10) },
    { id: generateId('2025-08-04-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Energized from time off. Ready to perform.', timestamp: getDateTimestamp('2025-08-04', 15) }
  ]},
  { _id: generateId('2025-08-11'), _creationTime: getDateTimestamp('2025-08-11'), userId: 'demo-user', date: '2025-08-11', entries: [
    { id: generateId('2025-08-11-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Strong week ahead. Goals are clear.', timestamp: getDateTimestamp('2025-08-11', 7) },
    { id: generateId('2025-08-11-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Productive day. Finding my groove again.', timestamp: getDateTimestamp('2025-08-11', 21) }
  ]},
  { _id: generateId('2025-08-25'), _creationTime: getDateTimestamp('2025-08-25'), userId: 'demo-user', date: '2025-08-25', entries: [
    { id: generateId('2025-08-25-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Major milestone achieved. Team celebration.', timestamp: getDateTimestamp('2025-08-25', 14) },
    { id: generateId('2025-08-25-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Proud and energized. This is what success feels like.', timestamp: getDateTimestamp('2025-08-25', 16) }
  ]},

  // September - Strong finish to summer
  { _id: generateId('2025-09-02'), _creationTime: getDateTimestamp('2025-09-02'), userId: 'demo-user', date: '2025-09-02', entries: [
    { id: generateId('2025-09-02-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'September energy. Fall is my favorite season.', timestamp: getDateTimestamp('2025-09-02', 7) },
    { id: generateId('2025-09-02-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Q3 wrap-up planning. Strong quarter overall.', timestamp: getDateTimestamp('2025-09-02', 11) }
  ]},
  { _id: generateId('2025-09-15'), _creationTime: getDateTimestamp('2025-09-15'), userId: 'demo-user', date: '2025-09-15', entries: [
    { id: generateId('2025-09-15-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Sprint planning for Q4. Ambitious goals set.', timestamp: getDateTimestamp('2025-09-15', 10) },
    { id: generateId('2025-09-15-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Excited for the final quarter push.', timestamp: getDateTimestamp('2025-09-15', 20) }
  ]},
  { _id: generateId('2025-09-23'), _creationTime: getDateTimestamp('2025-09-23'), userId: 'demo-user', date: '2025-09-23', entries: [
    { id: generateId('2025-09-23-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Autumn equinox. Balance and reflection.', timestamp: getDateTimestamp('2025-09-23', 7) },
    { id: generateId('2025-09-23-2'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Feeling centered and purposeful.', timestamp: getDateTimestamp('2025-09-23', 15) }
  ]},

  // October - steady performance
  { _id: generateId('2025-10-01'), _creationTime: getDateTimestamp('2025-10-01'), userId: 'demo-user', date: '2025-10-01', entries: [
    { id: generateId('2025-10-01-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Final quarter begins. Let\'s finish strong.', timestamp: getDateTimestamp('2025-10-01', 7) },
    { id: generateId('2025-10-01-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'October goals set. Clear roadmap ahead.', timestamp: getDateTimestamp('2025-10-01', 10) }
  ]},
  { _id: generateId('2025-10-08'), _creationTime: getDateTimestamp('2025-10-08'), userId: 'demo-user', date: '2025-10-08', entries: [
    { id: generateId('2025-10-08-1'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Steady progress. Consistency is key.', timestamp: getDateTimestamp('2025-10-08', 11) },
    { id: generateId('2025-10-08-2'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Not flashy, just solid work. That\'s enough.', timestamp: getDateTimestamp('2025-10-08', 21) }
  ]},

  // Add a few more recent entries to show continuous activity
  { _id: generateId('2025-10-15'), _creationTime: getDateTimestamp('2025-10-15'), userId: 'demo-user', date: '2025-10-15', entries: [
    { id: generateId('2025-10-15-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning walk with dog. Fresh air cleared my mind.', timestamp: getDateTimestamp('2025-10-15', 7) },
    { id: generateId('2025-10-15-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Deep work session on main project. Made significant progress on core features.', timestamp: getDateTimestamp('2025-10-15', 10) },
    { id: generateId('2025-10-15-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Productive day overall. Completed 3 major tasks and made good progress.', timestamp: getDateTimestamp('2025-10-15', 20) }
  ]},
  { _id: generateId('2025-10-20'), _creationTime: getDateTimestamp('2025-10-20'), userId: 'demo-user', date: '2025-10-20', entries: [
    { id: generateId('2025-10-20-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Gym session: weights and cardio. Pushing personal records.', timestamp: getDateTimestamp('2025-10-20', 6) },
    { id: generateId('2025-10-20-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Team meeting went well. Good collaboration and creative ideas flowing.', timestamp: getDateTimestamp('2025-10-20', 11) },
    { id: generateId('2025-10-20-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Motivated by recent progress. Momentum is building.', timestamp: getDateTimestamp('2025-10-20', 15) },
    { id: generateId('2025-10-20-4'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Great day! Everything clicked and I was in a flow state.', timestamp: getDateTimestamp('2025-10-20', 21) }
  ]},
  { _id: generateId('2025-10-25'), _creationTime: getDateTimestamp('2025-10-25'), userId: 'demo-user', date: '2025-10-25', entries: [
    { id: generateId('2025-10-25-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Started the day with 20 minutes of meditation and yoga. Feeling centered and ready.', timestamp: getDateTimestamp('2025-10-25', 7) },
    { id: generateId('2025-10-25-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Client presentation was a success! They loved the proposal.', timestamp: getDateTimestamp('2025-10-25', 14) },
    { id: generateId('2025-10-25-3'), templateId: 'evening-reflection', templateName: 'Evening Reflection', content: 'Really proud of what I accomplished. Celebrating small wins.', timestamp: getDateTimestamp('2025-10-25', 20) }
  ]},
  { _id: generateId('2025-10-27'), _creationTime: getDateTimestamp('2025-10-27'), userId: 'demo-user', date: '2025-10-27', entries: [
    { id: generateId('2025-10-27-1'), templateId: 'morning-routine', templateName: 'Morning Routine', content: 'Morning run at sunrise, 5k in 28 minutes. Energy levels high!', timestamp: getDateTimestamp('2025-10-27', 6) },
    { id: generateId('2025-10-27-2'), templateId: 'work-focus', templateName: 'Work Focus', content: 'Focused on debugging. Finally solved that tricky issue.', timestamp: getDateTimestamp('2025-10-27', 10) },
    { id: generateId('2025-10-27-3'), templateId: 'mood-check', templateName: 'Mood Check', content: 'Reflective mood today. Thinking about long-term goals.', timestamp: getDateTimestamp('2025-10-27', 16) }
  ]},
];

// Debug: Log when module is loaded
console.log('[demoData2025 MODULE] Exported data length:', DEMO_DATA_2025.length);
console.log('[demoData2025 MODULE] First 3 dates:', DEMO_DATA_2025.slice(0, 3).map(d => d.date));

export const DEMO_USER_ID = 'demo-user';
