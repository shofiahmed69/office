/**
 * Real MIT, Harvard, and Stanford course videos for Content Library.
 * All YouTube IDs are official course lectures. Progress: next video unlocks after completing the previous.
 */

export interface MockVideo {
  id: string
  title: string
  duration: string
  thumbnail: string
  youtubeId: string
}

export interface MockCourse {
  id: number
  name: string
  videos: MockVideo[]
}

function thumb(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
}

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 1,
    name: 'MIT 6.0001 – Introduction to Computer Science and Programming in Python (Fall 2016)',
    videos: [
      { id: 'mit-1', title: 'Lecture 1: What is Computation?', duration: '50:30', thumbnail: thumb('nykOeWgQcHM'), youtubeId: 'nykOeWgQcHM' },
      { id: 'mit-2', title: 'Lecture 2: Branching and Iteration', duration: '50:42', thumbnail: thumb('0jljZRnHwOI'), youtubeId: '0jljZRnHwOI' },
      { id: 'mit-3', title: 'Lecture 3: String Manipulation, Guess and Check, Approximations, Bisection', duration: '52:24', thumbnail: thumb('SE4P7IVCunE'), youtubeId: 'SE4P7IVCunE' },
      { id: 'mit-4', title: 'Lecture 4: Decomposition, Abstraction, and Functions', duration: '50:33', thumbnail: thumb('MjbuarJ7SE0'), youtubeId: 'MjbuarJ7SE0' },
      { id: 'mit-5', title: 'Lecture 5: Tuples, Lists, Aliasing, Mutability, and Cloning', duration: '50:45', thumbnail: thumb('2iQqRI0eqxM'), youtubeId: '2iQqRI0eqxM' },
      { id: 'mit-6', title: 'Lecture 6: Recursion and Dictionaries', duration: '51:20', thumbnail: thumb('WPSeyjX1-4s'), youtubeId: 'WPSeyjX1-4s' },
      { id: 'mit-7', title: 'Lecture 7: Testing, Debugging, Exceptions, and Assertions', duration: '41:30', thumbnail: thumb('9H6muyZjms0'), youtubeId: '9H6muyZjms0' },
      { id: 'mit-8', title: 'Lecture 8: Object Oriented Programming', duration: '50:28', thumbnail: thumb('-DP1i2ZU9gk'), youtubeId: '-DP1i2ZU9gk' },
      { id: 'mit-9', title: 'Lecture 9: Understanding Program Efficiency, Part 1', duration: '48:35', thumbnail: thumb('o9nW0uBqvEo'), youtubeId: 'o9nW0uBqvEo' },
    ],
  },
  {
    id: 2,
    name: 'Harvard CS50 – Introduction to Computer Science (2024)',
    videos: [
      { id: 'cs50-1', title: 'Lecture 1 – C', duration: '2:27:00', thumbnail: thumb('cwtpLIWylAw'), youtubeId: 'cwtpLIWylAw' },
      { id: 'cs50-2', title: 'Lecture 2 – Arrays', duration: '2:20:00', thumbnail: thumb('4vU4aEFmTSo'), youtubeId: '4vU4aEFmTSo' },
      { id: 'cs50-3', title: 'Lecture 3 – Algorithms', duration: '2:15:00', thumbnail: thumb('jZzyERW7h1A'), youtubeId: 'jZzyERW7h1A' },
      { id: 'cs50-4', title: 'Lecture 4 – Memory', duration: '2:22:00', thumbnail: thumb('F9-yqoS7b8w'), youtubeId: 'F9-yqoS7b8w' },
      { id: 'cs50-5', title: 'Lecture 5 – Data Structures', duration: '2:28:00', thumbnail: thumb('0euvEdPwQnQ'), youtubeId: '0euvEdPwQnQ' },
      { id: 'cs50-6', title: 'Lecture 6 – Python', duration: '2:09:00', thumbnail: thumb('EHi0RDZ31VA'), youtubeId: 'EHi0RDZ31VA' },
      { id: 'cs50-7', title: 'Lecture 7 – SQL', duration: '2:14:00', thumbnail: thumb('1RCMYG8RUSE'), youtubeId: '1RCMYG8RUSE' },
      { id: 'cs50-8', title: 'Lecture 8 – HTML, CSS, JavaScript', duration: '2:29:00', thumbnail: thumb('ciz2UaifaNM'), youtubeId: 'ciz2UaifaNM' },
      { id: 'cs50-9', title: 'Lecture 9 – Flask', duration: '2:28:00', thumbnail: thumb('-aqUek49iL8'), youtubeId: '-aqUek49iL8' },
    ],
  },
  {
    id: 3,
    name: 'Stanford CS229 – Machine Learning (Andrew Ng, Autumn 2018)',
    videos: [
      { id: 'cs229-1', title: 'Lecture 1 – Introduction', duration: '1:15:00', thumbnail: thumb('jGwO_UgTS7I'), youtubeId: 'jGwO_UgTS7I' },
      { id: 'cs229-2', title: 'Lecture 2 – Linear Regression and Gradient Descent', duration: '1:11:00', thumbnail: thumb('4b4MUYve_U8'), youtubeId: '4b4MUYve_U8' },
      { id: 'cs229-3', title: "Lecture 3 – Weighted Least Squares, Logistic Regression, Newton's Method", duration: '1:12:00', thumbnail: thumb('HZ4cvaztQEs'), youtubeId: 'HZ4cvaztQEs' },
      { id: 'cs229-4', title: 'Lecture 4 – Perceptron & Generalized Linear Model', duration: '1:22:00', thumbnail: thumb('iZTeva0WSTQ'), youtubeId: 'iZTeva0WSTQ' },
      { id: 'cs229-5', title: 'Lecture 5 – Gaussian Discriminant Analysis, Naive Bayes', duration: '1:08:00', thumbnail: thumb('RMy_1mO4HLk'), youtubeId: 'RMy_1mO4HLk' },
      { id: 'cs229-6', title: 'Lecture 6 – Support Vector Machines', duration: '1:14:00', thumbnail: thumb('lDwow4aOrtg'), youtubeId: 'lDwow4aOrtg' },
      { id: 'cs229-7', title: 'Lecture 7 – Kernels', duration: '1:12:00', thumbnail: thumb('8NYoQiRANpg'), youtubeId: '8NYoQiRANpg' },
      { id: 'cs229-8', title: 'Lecture 8 – Data Splits, Models & Cross-Validation', duration: '1:12:00', thumbnail: thumb('rjbkWSTjHzM'), youtubeId: 'rjbkWSTjHzM' },
    ],
  },
]

const STORAGE_KEY = 'content-completed'

export function getCompletedVideoIds(courseId: number): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${courseId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function markVideoCompleted(courseId: number, videoId: string): void {
  if (typeof window === 'undefined') return
  try {
    const completed = getCompletedVideoIds(courseId)
    if (completed.includes(videoId)) return
    completed.push(videoId)
    localStorage.setItem(`${STORAGE_KEY}-${courseId}`, JSON.stringify(completed))
  } catch {
    // ignore
  }
}

export function isVideoUnlocked(course: MockCourse, videoIndex: number, completedIds: string[]): boolean {
  if (videoIndex === 0) return true
  const prevVideo = course.videos[videoIndex - 1]
  return prevVideo ? completedIds.includes(prevVideo.id) : true
}

const TOPIC_STORAGE_KEY = 'content-completed-topic'

export function getCompletedVideoIdsForTopic(topic: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const key = `${TOPIC_STORAGE_KEY}-${encodeURIComponent(topic)}`
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function markVideoCompletedForTopic(topic: string, videoId: string): void {
  if (typeof window === 'undefined') return
  try {
    const completed = getCompletedVideoIdsForTopic(topic)
    if (completed.includes(videoId)) return
    completed.push(videoId)
    const key = `${TOPIC_STORAGE_KEY}-${encodeURIComponent(topic)}`
    localStorage.setItem(key, JSON.stringify(completed))
  } catch {
    // ignore
  }
}

export function isVideoUnlockedForTopic(
  videos: { id: string }[],
  videoIndex: number,
  completedIds: string[]
): boolean {
  if (videoIndex === 0) return true
  const prev = videos[videoIndex - 1]
  return prev ? completedIds.includes(prev.id) : true
}
